// Shared types for LatamPay

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  userId: string;
  createdAt: Date;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

