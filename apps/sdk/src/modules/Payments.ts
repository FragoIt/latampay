import { ethers, Signer, EventLog } from 'ethers';
import EventEmitter from 'eventemitter3';
import { validateToken } from '../utils/validation';
import {
  generatePaymentId,
  validatePaymentParams,
  generateQRCode,
  waitForTransaction,
  retryWithBackoff,
  estimateGasCostUSD,
  formatAmountToWei,
  formatAmountFromWei,
  generatePaymentLink,
  calculateExpiryTimestamp,
  parseContractError,
} from '../utils/payment-helpers';
import {
  CreatePaymentParams,
  Payment,
  PaymentResult,
  PaymentStatus,
  PaymentFilters,
  PaymentStatusEnum,
  PaymentFiltersSchema,
} from '../types/payment';
import {
  PaymentNotFoundError,
  PaymentExpiredError,
  PaymentAlreadyCompletedError,
  UnauthorizedMerchantError,
  GasPriceTooHighError,
  TransactionFailedError,
} from '../types/sdk-errors';
import type { SupportedNetwork } from '../constants/contracts';

// Contract ABI for LatamPayGateway
const GATEWAY_ABI = [
  'function createPayment(bytes32 paymentId, address merchant, address token, uint256 amount, uint256 expiresAt) external',
  'function pay(bytes32 paymentId) external',
  'function cancelPayment(bytes32 paymentId) external',
  'function payments(bytes32) view returns (address merchant, address token, uint96 amount, bool completed, uint64 createdAt, uint64 expiresAt)',
  'event PaymentCreated(bytes32 indexed paymentId, address indexed merchant, address indexed token, uint256 amount, uint256 timestamp)',
  'event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, uint256 amountPaid, uint256 feeCollected, uint256 timestamp)',
  'event PaymentCancelled(bytes32 indexed paymentId, address indexed merchant, uint256 timestamp)',
];

/**
 * Payments Module - Handles all payment operations
 * Extends EventEmitter to emit payment lifecycle events
 */
export class PaymentsModule extends EventEmitter {
  private readonly MAX_GAS_COST_USD = 5;
  private readonly FEE_BPS = 30; // 0.3%
  
  constructor(
    private contract: ethers.Contract,
    private signer: Signer,
    private provider: ethers.Provider,
    private chain: SupportedNetwork
  ) {
    super();
  }

  /**
   * Create payment - generates payment intent and stores on-chain
   * @param params Payment creation parameters
   * @returns Complete payment object with link and QR code
   */
  async create(params: CreatePaymentParams): Promise<Payment> {
    const startTime = Date.now();
    
    try {
      // Step 1: Validate params with Zod
      const validatedParams = validatePaymentParams(params);
      
      // Step 2: Resolve merchant address (use param or signer)
      const merchantAddress = validatedParams.merchantAddress || (await this.signer.getAddress());
      
      // Step 3: Validate and normalize token
      const tokenInfo = await validateToken(
        validatedParams.currency,
        this.chain,
        this.provider
      );
      
      // Step 4: Generate unique payment ID
      const paymentId = generatePaymentId(
        merchantAddress,
        Date.now(),
        Math.random().toString(36)
      );
      
      // Step 5: Convert amount to wei (6 decimals for USDC/USDT)
      const amountWei = formatAmountToWei(validatedParams.amount, tokenInfo.decimals);
      
      // Step 6: Calculate expiry timestamp
      const expiryTimestamp = calculateExpiryTimestamp(validatedParams.expiresIn);
      
      // Step 7: Estimate gas and check cost
      const gasEstimate = await this.contract.createPayment.estimateGas(
        paymentId,
        merchantAddress,
        tokenInfo.address,
        amountWei,
        expiryTimestamp
      );
      
      const gasCostUSD = await estimateGasCostUSD(this.provider, gasEstimate);
      if (gasCostUSD > this.MAX_GAS_COST_USD) {
        throw new GasPriceTooHighError(gasCostUSD, this.MAX_GAS_COST_USD);
      }
      
      // Step 8: Call contract.createPayment() with retry logic
      const tx = await retryWithBackoff(async () => {
        return await this.contract.createPayment(
          paymentId,
          merchantAddress,
          tokenInfo.address,
          amountWei,
          expiryTimestamp,
          {
            gasLimit: gasEstimate + (gasEstimate * 20n / 100n), // +20% buffer
          }
        );
      });
      
      // Step 9: Wait for transaction confirmation
      const receipt = await waitForTransaction(this.provider, tx.hash, 1);
      
      // Step 10: Generate payment link
      const paymentLink = generatePaymentLink(paymentId);
      
      // Step 11: Generate QR code
      const qrCode = await generateQRCode(paymentLink);
      
      // Step 12: Build Payment object
      const payment: Payment = {
        id: paymentId,
        amount: validatedParams.amount,
        currency: tokenInfo.symbol,
        merchantAddress,
        status: PaymentStatusEnum.PENDING,
        paymentLink,
        qrCode,
        createdAt: new Date(),
        expiresAt: new Date(expiryTimestamp * 1000),
        metadata: validatedParams.metadata,
        description: validatedParams.description,
        txHash: receipt.hash,
      };
      
      // Emit success event
      this.emit('payment.created', {
        paymentId,
        amount: validatedParams.amount,
        currency: tokenInfo.symbol,
        duration: Date.now() - startTime,
        txHash: receipt.hash,
      });
      
      return payment;
    } catch (error: any) {
      // Emit error event
      this.emit('payment.failed', {
        operation: 'create',
        error: parseContractError(error),
        params,
      });
      
      throw error;
    }
  }

  /**
   * Pay for a payment - executes the payment transaction
   * @param paymentId Payment identifier
   * @returns Payment result with transaction details
   */
  async pay(paymentId: string): Promise<PaymentResult> {
    const startTime = Date.now();
    
    try {
      // Step 1: Get payment info from contract
      const paymentData = await this.contract.payments(paymentId);
      
      // Step 2: Validate payment exists
      if (paymentData.merchant === ethers.ZeroAddress) {
        throw new PaymentNotFoundError(paymentId);
      }
      
      // Step 3: Check if already completed
      if (paymentData.completed) {
        throw new PaymentAlreadyCompletedError(paymentId);
      }
      
      // Step 4: Check if expired
      const now = Math.floor(Date.now() / 1000);
      if (paymentData.expiresAt > 0 && now > Number(paymentData.expiresAt)) {
        throw new PaymentExpiredError(paymentId, new Date(Number(paymentData.expiresAt) * 1000));
      }
      
      // Step 5: Calculate total (amount + fee 0.3%)
      const amount = paymentData.amount;
      const fee = (amount * BigInt(this.FEE_BPS)) / 10000n;
      const total = amount;
      
      // Step 6: Check and approve token if needed
      const token = new ethers.Contract(
        paymentData.token,
        [
          'function allowance(address,address) view returns (uint256)',
          'function approve(address,uint256) returns (bool)',
          'function balanceOf(address) view returns (uint256)',
        ],
        this.signer
      );
      
      const userAddress = await this.signer.getAddress();
      const allowance = await token.allowance(userAddress, await this.contract.getAddress());
      
      if (allowance < total) {
        const approveTx = await token.approve(await this.contract.getAddress(), ethers.MaxUint256);
        await waitForTransaction(this.provider, approveTx.hash, 1);
      }
      
      // Step 7: Estimate gas
      const gasEstimate = await this.contract.pay.estimateGas(paymentId);
      const gasCostUSD = await estimateGasCostUSD(this.provider, gasEstimate);
      
      if (gasCostUSD > this.MAX_GAS_COST_USD) {
        throw new GasPriceTooHighError(gasCostUSD, this.MAX_GAS_COST_USD);
      }
      
      // Step 8: Execute payment with retry logic
      const tx = await retryWithBackoff(async () => {
        return await this.contract.pay(paymentId, {
          gasLimit: gasEstimate + (gasEstimate * 20n / 100n),
        });
      });
      
      // Step 9: Wait for confirmation
      const receipt = await waitForTransaction(this.provider, tx.hash, 1);
      
      // Step 10: Parse events
      const completedEvent = receipt.logs
        .filter((log) => {
          try {
            const parsed = this.contract.interface.parseLog({
              topics: log.topics as string[],
              data: log.data,
            });
            return parsed?.name === 'PaymentCompleted';
          } catch {
            return false;
          }
        })
        .map((log) => this.contract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        }))[0];
      
      const feeCollected = completedEvent?.args?.feeCollected || 0n;
      
      // Build result
      const result: PaymentResult = {
        success: true,
        paymentId,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        fee: formatAmountFromWei(feeCollected, 6).toString(),
        timestamp: new Date(),
      };
      
      // Emit success event
      this.emit('payment.completed', {
        paymentId,
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        duration: Date.now() - startTime,
      });
      
      return result;
    } catch (error: any) {
      // Emit error event
      this.emit('payment.failed', {
        operation: 'pay',
        paymentId,
        error: parseContractError(error),
      });
      
      throw error;
    }
  }

  /**
   * Cancel a pending payment
   * @param paymentId Payment identifier
   */
  async cancel(paymentId: string): Promise<void> {
    try {
      // Step 1: Get payment info
      const paymentData = await this.contract.payments(paymentId);
      
      // Step 2: Validate payment exists
      if (paymentData.merchant === ethers.ZeroAddress) {
        throw new PaymentNotFoundError(paymentId);
      }
      
      // Step 3: Check if already completed
      if (paymentData.completed) {
        throw new PaymentAlreadyCompletedError(paymentId);
      }
      
      // Step 4: Verify signer is the merchant
      const signerAddress = await this.signer.getAddress();
      if (signerAddress.toLowerCase() !== paymentData.merchant.toLowerCase()) {
        throw new UnauthorizedMerchantError(paymentId, paymentData.merchant, signerAddress);
      }
      
      // Step 5: Call contract.cancelPayment()
      const tx = await retryWithBackoff(async () => {
        return await this.contract.cancelPayment(paymentId);
      });
      
      // Step 6: Wait for confirmation
      await waitForTransaction(this.provider, tx.hash, 1);
      
      // Emit event
      this.emit('payment.cancelled', { paymentId, txHash: tx.hash });
    } catch (error: any) {
      this.emit('payment.failed', {
        operation: 'cancel',
        paymentId,
        error: parseContractError(error),
      });
      
      throw error;
    }
  }

  /**
   * Get payment status
   * @param paymentId Payment identifier
   * @returns Payment status information
   */
  async getStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      // Query contract
      const paymentData = await this.contract.payments(paymentId);
      
      // Check if payment exists
      if (paymentData.merchant === ethers.ZeroAddress) {
        throw new PaymentNotFoundError(paymentId);
      }
      
      const now = Math.floor(Date.now() / 1000);
      
      // Determine status
      let status: PaymentStatusEnum;
      if (paymentData.completed) {
        status = PaymentStatusEnum.COMPLETED;
      } else if (paymentData.expiresAt > 0 && now > Number(paymentData.expiresAt)) {
        status = PaymentStatusEnum.EXPIRED;
      } else {
        status = PaymentStatusEnum.PENDING;
      }
      
      return {
        id: paymentId,
        status,
        merchant: paymentData.merchant,
        amount: formatAmountFromWei(paymentData.amount, 6).toString(),
        token: paymentData.token,
      };
    } catch (error: any) {
      if (error instanceof PaymentNotFoundError) {
        throw error;
      }
      throw new Error(`Failed to get payment status: ${parseContractError(error)}`);
    }
  }

  /**
   * List payments with optional filters
   * @param filters Payment filters
   * @returns Array of payments
   */
  async list(filters?: PaymentFilters): Promise<Payment[]> {
    try {
      // Validate filters or use defaults
      const validatedFilters: PaymentFilters = filters 
        ? PaymentFiltersSchema.parse(filters)
        : { limit: 20, offset: 0 };
      
      // Query PaymentCreated events
      const eventFilter = this.contract.filters.PaymentCreated(
        null,
        validatedFilters.merchant || null,
        null
      );
      
      const events = await this.contract.queryFilter(eventFilter, -10000); // Last ~10k blocks
      
      // Build payment objects
      const payments: Payment[] = [];
      
      for (const event of events) {
        const eventLog = event as EventLog;
        const paymentId = eventLog.args?.paymentId;
        
        if (!paymentId) continue;
        
        // Get current status
        const status = await this.getStatus(paymentId);
        
        // Apply status filter
        if (validatedFilters.status && status.status !== validatedFilters.status) {
          continue;
        }
        
        // Get payment data
        const paymentData = await this.contract.payments(paymentId);
        
        const payment: Payment = {
          id: paymentId,
          amount: formatAmountFromWei(paymentData.amount, 6),
          currency: 'USDC', // TODO: detect from token address
          merchantAddress: paymentData.merchant,
          status: status.status,
          paymentLink: generatePaymentLink(paymentId),
          qrCode: '', // Not generated for list
          createdAt: new Date(Number(paymentData.createdAt) * 1000),
          expiresAt: new Date(Number(paymentData.expiresAt) * 1000),
          txHash: eventLog.transactionHash,
        };
        
        payments.push(payment);
      }
      
      // Apply pagination
      const start = validatedFilters.offset || 0;
      const end = start + (validatedFilters.limit || 20);
      
      return payments.slice(start, end);
    } catch (error: any) {
      throw new Error(`Failed to list payments: ${parseContractError(error)}`);
    }
  }
}
