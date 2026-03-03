/**
 * Custom SDK errors for better error handling
 */

export class LatamPaySDKError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'LatamPaySDKError';
    Object.setPrototypeOf(this, LatamPaySDKError.prototype);
  }
}

export class PaymentNotFoundError extends LatamPaySDKError {
  constructor(paymentId: string) {
    super(`Payment not found: ${paymentId}`, 'PAYMENT_NOT_FOUND', { paymentId });
    this.name = 'PaymentNotFoundError';
    Object.setPrototypeOf(this, PaymentNotFoundError.prototype);
  }
}

export class PaymentExpiredError extends LatamPaySDKError {
  constructor(paymentId: string, expiresAt: Date) {
    super(`Payment expired: ${paymentId}`, 'PAYMENT_EXPIRED', { paymentId, expiresAt });
    this.name = 'PaymentExpiredError';
    Object.setPrototypeOf(this, PaymentExpiredError.prototype);
  }
}

export class PaymentAlreadyCompletedError extends LatamPaySDKError {
  constructor(paymentId: string) {
    super(`Payment already completed: ${paymentId}`, 'PAYMENT_ALREADY_COMPLETED', { paymentId });
    this.name = 'PaymentAlreadyCompletedError';
    Object.setPrototypeOf(this, PaymentAlreadyCompletedError.prototype);
  }
}

export class InsufficientBalanceError extends LatamPaySDKError {
  constructor(required: string, available: string, token: string) {
    super(
      `Insufficient balance: required ${required} ${token}, available ${available} ${token}`,
      'INSUFFICIENT_BALANCE',
      { required, available, token }
    );
    this.name = 'InsufficientBalanceError';
    Object.setPrototypeOf(this, InsufficientBalanceError.prototype);
  }
}

export class InsufficientAllowanceError extends LatamPaySDKError {
  constructor(required: string, approved: string, token: string) {
    super(
      `Insufficient allowance: required ${required} ${token}, approved ${approved} ${token}`,
      'INSUFFICIENT_ALLOWANCE',
      { required, approved, token }
    );
    this.name = 'InsufficientAllowanceError';
    Object.setPrototypeOf(this, InsufficientAllowanceError.prototype);
  }
}

export class InvalidTokenError extends LatamPaySDKError {
  constructor(token: string) {
    super(`Invalid or unsupported token: ${token}`, 'INVALID_TOKEN', { token });
    this.name = 'InvalidTokenError';
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}

export class GasPriceTooHighError extends LatamPaySDKError {
  constructor(estimatedCostUSD: number, maxUSD: number = 5) {
    super(
      `Gas price too high: estimated $${estimatedCostUSD.toFixed(2)} (max $${maxUSD})`,
      'GAS_PRICE_TOO_HIGH',
      { estimatedCostUSD, maxUSD }
    );
    this.name = 'GasPriceTooHighError';
    Object.setPrototypeOf(this, GasPriceTooHighError.prototype);
  }
}

export class UnauthorizedMerchantError extends LatamPaySDKError {
  constructor(paymentId: string, expectedMerchant: string, actualSigner: string) {
    super(
      `Unauthorized: signer ${actualSigner} is not the merchant ${expectedMerchant}`,
      'UNAUTHORIZED_MERCHANT',
      { paymentId, expectedMerchant, actualSigner }
    );
    this.name = 'UnauthorizedMerchantError';
    Object.setPrototypeOf(this, UnauthorizedMerchantError.prototype);
  }
}

export class ValidationError extends LatamPaySDKError {
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', { fieldErrors });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class TransactionFailedError extends LatamPaySDKError {
  constructor(txHash: string, reason?: string) {
    super(
      `Transaction failed: ${txHash}${reason ? ` - ${reason}` : ''}`,
      'TRANSACTION_FAILED',
      { txHash, reason }
    );
    this.name = 'TransactionFailedError';
    Object.setPrototypeOf(this, TransactionFailedError.prototype);
  }
}

export class NetworkError extends LatamPaySDKError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', { originalError: originalError?.message });
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
