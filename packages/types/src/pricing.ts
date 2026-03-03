export enum Plan {
  FREE = 'FREE',
  PRO = 'PRO',
  GROWTH = 'GROWTH',
  SCALE = 'SCALE',
  ENTERPRISE = 'ENTERPRISE'
}

export interface PlanConfig {
  name: Plan;
  price: number; // USD/mes
  volumeIncluded: number; // USD
  invoicesIncluded: number;
  features: string[];
  feeRate: number; // En basis points (0.30% = 30)
  minFee: number; // USD
}

export const PLAN_CONFIGS: Record<Plan, PlanConfig> = {
  [Plan.FREE]: {
    name: Plan.FREE,
    price: 0,
    volumeIncluded: 0,
    invoicesIncluded: 10,
    features: ['Basic dashboard', 'Community support'],
    feeRate: 35, // 0.35%
    minFee: 0.25
  },
  [Plan.PRO]: {
    name: Plan.PRO,
    price: 49,
    volumeIncluded: 25000,
    invoicesIncluded: -1, // Unlimited
    features: [
      'Unlimited invoices',
      'Remove branding',
      'Email support <48h',
      'API keys'
    ],
    feeRate: 30, // 0.30%
    minFee: 0.25
  },
  [Plan.GROWTH]: {
    name: Plan.GROWTH,
    price: 119,
    volumeIncluded: 75000,
    invoicesIncluded: -1,
    features: [
      'Everything in Pro',
      'Webhooks',
      'Recurring subscriptions',
      'Analytics dashboard',
      '5 team members'
    ],
    feeRate: 25, // 0.25%
    minFee: 0.25
  },
  [Plan.SCALE]: {
    name: Plan.SCALE,
    price: 299,
    volumeIncluded: 250000,
    invoicesIncluded: -1,
    features: [
      'Everything in Growth',
      'White-label',
      'Priority support <12h',
      'Custom integrations',
      'Dedicated account manager'
    ],
    feeRate: 20, // 0.20%
    minFee: 0.25
  },
  [Plan.ENTERPRISE]: {
    name: Plan.ENTERPRISE,
    price: 1000,
    volumeIncluded: 1000000,
    invoicesIncluded: -1,
    features: [
      'Everything in Scale',
      'SLA',
      'On-premise option',
      'Audit & compliance',
      'Dedicated infra'
    ],
    feeRate: 15, // 0.15%
    minFee: 0
  }
};

export enum AddOn {
  FISCAL = 'FISCAL',
  ANALYTICS = 'ANALYTICS',
  RECURRING = 'RECURRING',
  PAYOUTS = 'PAYOUTS',
  KYC = 'KYC'
}

export const ADDON_CONFIGS: Record<AddOn, { price: number; name: string }> = {
  [AddOn.FISCAL]: { price: 39, name: 'Fiscal/Accounting Module' },
  [AddOn.ANALYTICS]: { price: 39, name: 'Advanced Analytics' },
  [AddOn.RECURRING]: { price: 29, name: 'Recurring Billing Suite' },
  [AddOn.PAYOUTS]: { price: 10, name: 'Mass Payouts (per 200)' },
  [AddOn.KYC]: { price: 49, name: 'KYC/Compliance Module' }
};
