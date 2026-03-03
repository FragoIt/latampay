// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Polygon Mainnet
  137: {
    gateway: process.env.NEXT_PUBLIC_GATEWAY_ADDRESS_MAINNET || '0x0000000000000000000000000000000000000000',
    usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Native USDC on Polygon
    usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT on Polygon
  },
  // Polygon Amoy Testnet
  80002: {
    gateway: process.env.NEXT_PUBLIC_GATEWAY_ADDRESS_TESTNET || '0x0000000000000000000000000000000000000000',
    usdc: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // Mock USDC on Amoy
    usdt: '0x1Cd0de52F5A15f7d6b7EEB5e9d8C2E5E7d7e1E5A', // Mock USDT on Amoy
  },
} as const;

// Helper exports for easier access
export const GATEWAY_ADDRESS = {
  mainnet: CONTRACT_ADDRESSES[137].gateway as `0x${string}`,
  testnet: CONTRACT_ADDRESSES[80002].gateway as `0x${string}`,
} as const;

export const TOKEN_ADDRESSES = {
  mainnet: {
    USDC: CONTRACT_ADDRESSES[137].usdc as `0x${string}`,
    USDT: CONTRACT_ADDRESSES[137].usdt as `0x${string}`,
  },
  testnet: {
    USDC: CONTRACT_ADDRESSES[80002].usdc as `0x${string}`,
    USDT: CONTRACT_ADDRESSES[80002].usdt as `0x${string}`,
  },
} as const;

// Token decimals
export const TOKEN_DECIMALS = {
  USDC: 6,
  USDT: 6,
} as const;

// Gateway ABI - Updated to match LatamPayGatewayV2.sol
export const GATEWAY_ABI = [
  // payWithPermit - Main payment function with EIP-2612 permit
  {
    name: 'payWithPermit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'paymentId', type: 'bytes32' },
      { name: 'merchant', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'planTier', type: 'uint8' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    outputs: [],
  },
  // pay - Fallback for pre-approved tokens
  {
    name: 'pay',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'paymentId', type: 'bytes32' },
      { name: 'merchant', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'planTier', type: 'uint8' },
    ],
    outputs: [],
  },
  // Read functions
  {
    name: 'isPaymentProcessed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'paymentId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'calculateFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'planTier', type: 'uint8' },
      { name: 'token', type: 'address' },
    ],
    outputs: [
      { name: 'fee', type: 'uint256' },
      { name: 'total', type: 'uint256' },
    ],
  },
  {
    name: 'supportedTokens',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'planFees',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'planTier', type: 'uint8' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Events
  {
    name: 'PaymentCompleted',
    type: 'event',
    inputs: [
      { name: 'paymentId', type: 'bytes32', indexed: true },
      { name: 'payer', type: 'address', indexed: true },
      { name: 'merchant', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: false },
      { name: 'amountPaid', type: 'uint256', indexed: false },
      { name: 'feeCollected', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
      { name: 'planTier', type: 'uint8', indexed: false },
    ],
  },
] as const;

// ERC20 Permit ABI
export const ERC20_PERMIT_ABI = [
  {
    name: 'permit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'nonces',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'DOMAIN_SEPARATOR',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
