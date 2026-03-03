# LatamPay SDK

TypeScript SDK for integrating LatamPay payment gateway with EIP-2612 permit support.

## Features

✅ **One-Click Payments** - EIP-2612 permit support for gasless approvals  
✅ **Token Validation** - Automatic USDC/USDT normalization and validation  
✅ **Pre-flight Checks** - Balance and allowance validation before transactions  
✅ **Retry Logic** - Exponential backoff for failed transactions  
✅ **Observability** - Sentry integration for error tracking  
✅ **Plan Tiers** - Support for FREE, PRO, GROWTH, SCALE, ENTERPRISE plans

## Installation

```bash
npm install @latampay/sdk ethers@^6
```

## Quick Start

```typescript
import { LatamPay } from '@latampay/sdk';
import { ethers } from 'ethers';

// Initialize with MetaMask or any ethers Signer
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const latampay = new LatamPay(signer, {
  network: 'polygon',
  sentryDsn: 'YOUR_SENTRY_DSN', // Optional
});

// Create a payment
const payment = await latampay.payments.create({
  amount: 100, // $100 USD
  currency: 'USDC',
  description: 'Invoice #1234',
});

console.log('Payment Link:', payment.paymentLink);
console.log('QR Code:', payment.qrCode);

// Pay (customer side)
const result = await latampay.payments.pay(payment.id, 1); // planTier: 1 = PRO
console.log('Transaction:', result.txHash);
```

## API Reference

### LatamPay

Main SDK class.

```typescript
new LatamPay(signer: Signer, config: LatamPayConfig, options?: SDKOptions)
```

**Config Options:**

- `network`: 'polygon' | 'polygon-mumbai'
- `rpcUrl?`: Custom RPC URL (optional if signer has provider)
- `sentryDsn?`: Sentry DSN for error tracking
- `enableRetry?`: Enable retry logic (default: true)
- `maxRetries?`: Maximum retry attempts (default: 3)

### Payments Module

#### `create(params: CreatePaymentParams): Promise<Payment>`

Create a new payment intent.

**Params:**

- `amount`: Payment amount in USD
- `currency?`: 'USDC' | 'USDT' (default: 'USDC')
- `merchantAddress?`: Merchant wallet (default: signer address)
- `description?`: Payment description
- `expiresIn?`: Expiration in seconds (default: 86400 = 24h)
- `metadata?`: Custom metadata object

**Returns:**

```typescript
{
  id: string;
  amount: number;
  currency: string;
  merchantAddress: string;
  status: 'pending';
  paymentLink: string;
  qrCode: string; // Data URL
  createdAt: Date;
  expiresAt: Date;
}
```

#### `pay(paymentId: string, planTier?: number): Promise<PaymentResult>`

Execute payment with automatic permit detection.

**Params:**

- `paymentId`: Payment ID from `create()`
- `planTier`: 0 (FREE) | 1 (PRO) | 2 (GROWTH) | 3 (SCALE) | 4 (ENTERPRISE)

**Returns:**

```typescript
{
  success: true;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
}
```

#### `getStatus(paymentId: string): Promise<PaymentStatus>`

Get payment status.

**Returns:**

```typescript
{
  id: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  txHash?: string;
  paidAt?: Date;
}
```

## Error Handling

```typescript
import { TokenValidationError, PaymentError } from '@latampay/sdk';

try {
  await latampay.payments.pay(paymentId);
} catch (error) {
  if (error instanceof TokenValidationError) {
    console.error('Token error:', error.message);
    console.log('Fix:', error.remediation);
  } else if (error instanceof PaymentError) {
    console.error('Payment error:', error.message);
  }
}
```

## Plan Tiers & Fees

| Tier           | Fee Rate | Min Fee | Max Volume |
| -------------- | -------- | ------- | ---------- |
| FREE (0)       | 0.35%    | $0.25   | -          |
| PRO (1)        | 0.30%    | $0.25   | $25K       |
| GROWTH (2)     | 0.25%    | $0.25   | $75K       |
| SCALE (3)      | 0.20%    | $0.25   | $250K      |
| ENTERPRISE (4) | 0.15%    | -       | $1M+       |

## Advanced Usage

### Pre-flight Checks

```typescript
import { preFlightCheck } from '@latampay/sdk';

const result = await preFlightCheck(
  userAddress,
  tokenAddress,
  spenderAddress,
  requiredAmount,
  provider
);

console.log('Balance:', result.balance);
console.log('Allowance:', result.allowance);
```

### Token Validation

```typescript
import { validateToken, normalizeToken } from '@latampay/sdk';

// Normalize symbols
const symbol = normalizeToken('usdc', 'polygon'); // 'USDC'

// Validate on-chain
const token = await validateToken('USDC', 'polygon', provider);
console.log('Supports permit:', token.supportsPermit);
```

### Manual Permit Signing

```typescript
import { signPermit } from '@latampay/sdk';

const signature = await signPermit(
  signer,
  tokenAddress,
  spenderAddress,
  amount,
  deadline,
  provider
);

console.log('Signature:', signature);
```

## License

MIT
