let initialized = false;

export function initMonitoring(dsn?: string) {
  if (initialized || !dsn) return;
  
  // Sentry initialization will be implemented when we integrate the actual SDK
  console.log('[Monitoring] Initialized with DSN:', dsn);
  
  initialized = true;
}

export function trackEvent(name: string, data?: Record<string, any>) {
  console.log(`[Event] ${name}`, data);
  
  if (initialized) {
    // Send to Sentry as breadcrumb
    console.log('[Sentry] Breadcrumb:', name, data);
  }
}

export function trackError(name: string, error: any) {
  console.error(`[Error] ${name}`, error);
  
  if (initialized) {
    // Send to Sentry as exception
    console.error('[Sentry] Exception:', name, error);
  }
}

export function setUser(userId: string, email?: string) {
  if (initialized) {
    console.log('[Sentry] User set:', userId, email);
  }
}
