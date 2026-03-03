export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
}

export interface DatadogConfig {
  apiKey: string;
  service: string;
  env: string;
  version: string;
}

export interface MonitoringConfig {
  sentry?: SentryConfig;
  datadog?: DatadogConfig;
  enableMetrics: boolean;
  enableTracing: boolean;
}

export function initSentry(config: SentryConfig): void {
  // Sentry initialization will be implemented when we integrate the actual SDK
  console.log('[Monitoring] Sentry initialized', { environment: config.environment });
}

export function initDatadog(config: DatadogConfig): void {
  // Datadog initialization will be implemented when we integrate the actual SDK
  console.log('[Monitoring] Datadog initialized', { service: config.service });
}

export function captureException(error: Error, context?: Record<string, any>): void {
  console.error('[Monitoring] Exception captured:', error, context);
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  console.log(`[Monitoring] [${level.toUpperCase()}]`, message);
}

export function setUser(user: { id: string; email?: string; username?: string }): void {
  console.log('[Monitoring] User set:', user.id);
}

export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}): void {
  console.log('[Monitoring] Breadcrumb:', breadcrumb.message);
}
