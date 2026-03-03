import { ethers } from 'ethers';
import QRCode from 'qrcode';
import { CreatePaymentParams, CreatePaymentParamsSchema } from '../types/payment';
import { ValidationError, NetworkError } from '../types/sdk-errors';

/**
 * Generate a unique payment ID using keccak256
 */
export function generatePaymentId(merchant: string, timestamp: number, random: string): string {
  const data = ethers.solidityPacked(
    ['address', 'uint256', 'bytes32'],
    [merchant, timestamp, ethers.id(random)]
  );
  return ethers.keccak256(data);
}

/**
 * Validate payment creation parameters using Zod
 */
export function validatePaymentParams(params: CreatePaymentParams): CreatePaymentParams {
  try {
    return CreatePaymentParamsSchema.parse(params);
  } catch (error: any) {
    const fieldErrors: Record<string, string> = {};
    if (error.errors) {
      error.errors.forEach((err: any) => {
        const field = err.path.join('.');
        fieldErrors[field] = err.message;
      });
    }
    throw new ValidationError('Invalid payment parameters', fieldErrors);
  }
}

/**
 * Generate QR code as base64 PNG
 */
export async function generateQRCode(link: string): Promise<string> {
  try {
    return await QRCode.toDataURL(link, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
  } catch (error: any) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  provider: ethers.Provider,
  txHash: string,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt> {
  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    if (!receipt) {
      throw new Error('Transaction receipt not found');
    }
    if (receipt.status === 0) {
      throw new Error('Transaction reverted');
    }
    return receipt;
  } catch (error: any) {
    throw new NetworkError(`Failed to wait for transaction: ${error.message}`, error);
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on validation errors or user-initiated errors
      if (
        error.code === 'VALIDATION_ERROR' ||
        error.code === 'UNAUTHORIZED_MERCHANT' ||
        error.code === 'ACTION_REJECTED'
      ) {
        throw error;
      }
      
      // If this was the last attempt, throw
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Estimate gas cost in USD
 */
export async function estimateGasCostUSD(
  provider: ethers.Provider,
  gasEstimate: bigint,
  maticPriceUSD: number = 0.8 // Default MATIC price
): Promise<number> {
  try {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || 0n;
    
    // Gas cost in MATIC
    const gasCostMatic = Number(ethers.formatUnits(gasPrice * gasEstimate, 'ether'));
    
    // Convert to USD
    return gasCostMatic * maticPriceUSD;
  } catch (error: any) {
    console.warn('Failed to estimate gas cost:', error.message);
    return 0;
  }
}

/**
 * Format amount from human-readable to wei (6 decimals for USDC/USDT)
 */
export function formatAmountToWei(amount: number, decimals: number = 6): bigint {
  return ethers.parseUnits(amount.toString(), decimals);
}

/**
 * Format amount from wei to human-readable
 */
export function formatAmountFromWei(amount: bigint, decimals: number = 6): number {
  return Number(ethers.formatUnits(amount, decimals));
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Generate payment link
 */
export function generatePaymentLink(paymentId: string, baseUrl: string = 'https://pay.latampay.io'): string {
  return `${baseUrl}/${paymentId}`;
}

/**
 * Calculate expiry timestamp
 */
export function calculateExpiryTimestamp(expiresInSeconds: number): number {
  return Math.floor(Date.now() / 1000) + expiresInSeconds;
}

/**
 * Parse contract error and make it user-friendly
 */
export function parseContractError(error: any): string {
  // Handle common contract errors
  if (error.code === 'CALL_EXCEPTION') {
    if (error.reason) {
      return error.reason;
    }
    if (error.data) {
      return `Contract error: ${error.data}`;
    }
  }
  
  // Handle ethers errors
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds to pay for gas';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error: please check your connection';
  }
  
  if (error.code === 'TIMEOUT') {
    return 'Transaction timeout: network is congested';
  }
  
  if (error.code === 'ACTION_REJECTED') {
    return 'Transaction rejected by user';
  }
  
  // Default
  return error.message || 'Unknown error occurred';
}
