import { z } from 'zod';

/**
 * Payment creation parameters
 */
export const CreatePaymentParamsSchema = z.object({
  amount: z.number().positive().max(1_000_000, 'Amount too large (max $1M)'),
  currency: z.enum(['USDC', 'USDT']).default('USDC'),
  merchantAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
  expiresIn: z.number().int().positive().max(86400 * 7, 'Max expiry is 7 days').default(86400), // 24h default
  metadata: z.record(z.string(), z.any()).optional(),
  description: z.string().max(500).optional(),
});

export type CreatePaymentParams = z.infer<typeof CreatePaymentParamsSchema>;

/**
 * Payment status enum
 */
export enum PaymentStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Payment object
 */
export interface Payment {
  id: string; // Payment ID (bytes32)
  amount: number; // USD amount
  currency: string; // 'USDC' | 'USDT'
  merchantAddress: string;
  status: PaymentStatusEnum;
  paymentLink: string;
  qrCode: string; // Base64 PNG
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  txHash?: string;
  metadata?: Record<string, any>;
  description?: string;
}

/**
 * Payment result after execution
 */
export interface PaymentResult {
  success: boolean;
  paymentId: string;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  fee: string; // Fee paid in tokens
  timestamp: Date;
}

/**
 * Payment status query result
 */
export interface PaymentStatus {
  id: string;
  status: PaymentStatusEnum;
  txHash?: string;
  completedAt?: Date;
  merchant?: string;
  amount?: string;
  token?: string;
}

/**
 * Payment list filters
 */
export const PaymentFiltersSchema = z.object({
  merchant: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  status: z.nativeEnum(PaymentStatusEnum).optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type PaymentFilters = z.infer<typeof PaymentFiltersSchema>;
