export interface Invoice {
  id: string;
  invoiceNumber: string;
  merchantId: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  
  // Payment details
  amount: number;
  currency: string;
  token?: string; // Token address if paid
  status: InvoiceStatus;
  
  // Dates
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date;
  
  // Blockchain
  paymentId?: string; // bytes32 from contract
  txHash?: string;
  
  // Metadata
  description?: string;
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface CreateInvoiceInput {
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  dueDate: Date;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  merchantId: string;
  customerId: string;
  
  // Subscription details
  amount: number;
  currency: string;
  interval: SubscriptionInterval;
  
  // Status
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  
  // Billing
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  failedAttempts: number;
  
  // Metadata
  description?: string;
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionInterval {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED'
}
