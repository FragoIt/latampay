import { ethers, Signer } from 'ethers';
import { CONTRACT_ADDRESSES, type SupportedNetwork } from './constants/contracts';
import { PaymentsModule } from './modules/Payments';
import { initMonitoring } from './utils/monitoring';
import type { LatamPayConfig, SDKOptions } from './types/config';

// Gateway ABI
const GATEWAY_ABI = [
  'function payWithPermit(bytes32 paymentId, address merchant, uint256 amount, address token, uint8 planTier, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external',
  'function pay(bytes32 paymentId, address merchant, uint256 amount, address token, uint8 planTier) external',
  'function calculateFee(uint256 amount, uint8 planTier, address token) view returns (uint256 fee, uint256 total)',
  'function isPaymentProcessed(bytes32 paymentId) view returns (bool)',
  'event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, address token, uint256 amountPaid, uint256 feeCollected, uint256 timestamp, uint8 planTier)'
];

/**
 * Main LatamPay SDK Class
 */
export class LatamPay {
  private provider: ethers.Provider;
  private signer: Signer;
  private contract: ethers.Contract;
  
  public payments: PaymentsModule;
  
  constructor(
    signer: Signer,
    config: LatamPayConfig,
    options?: SDKOptions
  ) {
    this.signer = signer;
    
    // Setup provider
    if (config.rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    } else {
      // Use signer's provider
      if (!signer.provider) {
        throw new Error('Signer must have a provider or rpcUrl must be provided');
      }
      this.provider = signer.provider;
    }
    
    // Initialize monitoring
    if (config.sentryDsn) {
      initMonitoring(config.sentryDsn);
    }
    
    // Get contract address
    const contractAddress = CONTRACT_ADDRESSES[config.network].LatamPayGateway;
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`LatamPayGateway not deployed on ${config.network}. Please deploy first.`);
    }
    
    // Initialize contract
    this.contract = new ethers.Contract(
      contractAddress,
      GATEWAY_ABI,
      this.signer
    );
    
    // Initialize modules
    this.payments = new PaymentsModule(
      this.contract,
      this.signer,
      this.provider,
      config.network
    );
  }
  
  /**
   * Get current user address
   */
  async getAddress(): Promise<string> {
    return await this.signer.getAddress();
  }
  
  /**
   * Get network info
   */
  async getNetwork(): Promise<ethers.Network> {
    return await this.provider.getNetwork();
  }
  
  /**
   * Get contract address
   */
  async getContractAddress(): Promise<string> {
    return await this.contract.getAddress();
  }
}
