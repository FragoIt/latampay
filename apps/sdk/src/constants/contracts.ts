export const CONTRACT_ADDRESSES = {
  polygon: {
    LatamPayGateway: '0x0000000000000000000000000000000000000000', // TODO: Deploy and update
  },
  'polygon-mumbai': {
    LatamPayGateway: '0x0000000000000000000000000000000000000000', // TODO: Deploy and update
  }
} as const;

export type SupportedNetwork = keyof typeof CONTRACT_ADDRESSES;

export const GATEWAY_ABI = [
  'function payWithPermit(bytes32 paymentId, address merchant, uint256 amount, address token, uint8 planTier, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external',
  'function pay(bytes32 paymentId, address merchant, uint256 amount, address token, uint8 planTier) external',
  'function calculateFee(uint256 amount, uint8 planTier, address token) external view returns (uint256 fee, uint256 total)',
  'function isPaymentProcessed(bytes32 paymentId) external view returns (bool)',
  'event PaymentCompleted(bytes32 indexed paymentId, address indexed payer, address indexed merchant, address token, uint256 amountPaid, uint256 feeCollected, uint256 timestamp, uint8 planTier)'
] as const;
