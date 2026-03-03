import type { SupportedNetwork } from '../constants/contracts';

export interface LatamPayConfig {
  network: SupportedNetwork;
  rpcUrl?: string;
  sentryDsn?: string;
  enableRetry?: boolean;
  maxRetries?: number;
}

export interface SDKOptions {
  verbose?: boolean;
  timeout?: number;
}
