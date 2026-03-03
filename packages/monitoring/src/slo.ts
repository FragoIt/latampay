import type { SLO, SLOStatus } from '@latampay/types';

export function calculateSLOStatus(
  slo: SLO,
  currentValue: number
): SLOStatus['status'] {
  if (slo.unit === 'percentage') {
    if (currentValue >= slo.target) return 'healthy';
    if (currentValue >= slo.alertThreshold) return 'warning';
    return 'critical';
  }
  
  // For time-based metrics (lower is better)
  if (slo.unit === 'seconds' || slo.unit === 'hours') {
    if (currentValue <= slo.target) return 'healthy';
    if (currentValue <= slo.alertThreshold) return 'warning';
    return 'critical';
  }
  
  return 'healthy';
}

export function formatSLOValue(slo: SLO, value: number): string {
  switch (slo.unit) {
    case 'percentage':
      return `${value.toFixed(2)}%`;
    case 'seconds':
      return `${value.toFixed(2)}s`;
    case 'hours':
      return `${value.toFixed(2)}h`;
    default:
      return value.toString();
  }
}

export function getSLOColor(status: SLOStatus['status']): string {
  switch (status) {
    case 'healthy':
      return 'green';
    case 'warning':
      return 'yellow';
    case 'critical':
      return 'red';
    default:
      return 'gray';
  }
}

export function calculateMTTR(incidents: Array<{ createdAt: Date; resolvedAt?: Date }>): number {
  const resolvedIncidents = incidents.filter(i => i.resolvedAt);
  
  if (resolvedIncidents.length === 0) return 0;
  
  const totalMinutes = resolvedIncidents.reduce((sum, incident) => {
    const duration = incident.resolvedAt!.getTime() - incident.createdAt.getTime();
    return sum + duration / (1000 * 60); // Convert to minutes
  }, 0);
  
  return totalMinutes / resolvedIncidents.length / 60; // Convert to hours
}
