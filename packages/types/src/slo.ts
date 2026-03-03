export interface SLO {
  name: string;
  target: number; // Percentage (97 = 97%) or absolute value for time-based SLOs
  window: '1h' | '24h' | '7d' | '30d';
  metric: string;
  alertThreshold: number;
  unit?: 'percentage' | 'seconds' | 'hours';
}

export const SLOS: SLO[] = [
  {
    name: 'Payment Success Rate',
    target: 97,
    window: '24h',
    metric: 'payment.success_rate',
    alertThreshold: 95,
    unit: 'percentage'
  },
  {
    name: 'SDK Response Time (p95)',
    target: 3, // seconds
    window: '1h',
    metric: 'sdk.response_time.p95',
    alertThreshold: 5,
    unit: 'seconds'
  },
  {
    name: 'API Uptime',
    target: 99.9,
    window: '30d',
    metric: 'api.uptime',
    alertThreshold: 99.5,
    unit: 'percentage'
  },
  {
    name: 'MTTR',
    target: 2, // hours
    window: '7d',
    metric: 'incidents.mttr',
    alertThreshold: 4,
    unit: 'hours'
  }
];

export interface SLOStatus {
  slo: SLO;
  currentValue: number;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: 'open' | 'investigating' | 'resolved';
  affectedSLOs: string[];
  createdAt: Date;
  resolvedAt?: Date;
  mttr?: number; // Minutes to resolution
}
