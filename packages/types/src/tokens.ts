export interface TokenConfig {
  address: string;
  decimals: number;
  supportsPermit: boolean;
  name: string;
  symbol: string;
}

export type NetworkTokens = Record<string, TokenConfig>;

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  tokens: NetworkTokens;
}

export const SUPPORTED_TOKENS = {
  polygon: {
    USDC: {
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      decimals: 6,
      supportsPermit: true,
      name: 'USD Coin',
      symbol: 'USDC'
    },
    'USDC.e': {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      supportsPermit: false,
      name: 'USD Coin (PoS)',
      symbol: 'USDC.e'
    },
    USDT: {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      decimals: 6,
      supportsPermit: false,
      name: 'Tether USD',
      symbol: 'USDT'
    }
  },
  'polygon-mumbai': {
    USDC: {
      address: '0x0FA8781a83E46826621b3BC094Ea2A0212e71B23',
      decimals: 6,
      supportsPermit: true,
      name: 'Mock USDC',
      symbol: 'USDC'
    },
    USDT: {
      address: '0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832',
      decimals: 6,
      supportsPermit: false,
      name: 'Mock USDT',
      symbol: 'USDT'
    }
  }
} as const;

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    tokens: SUPPORTED_TOKENS.polygon
  },
  'polygon-mumbai': {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    tokens: SUPPORTED_TOKENS['polygon-mumbai']
  }
};

// Helper functions
export function getTokenByAddress(network: string, address: string): TokenConfig | undefined {
  const tokens = SUPPORTED_TOKENS[network as keyof typeof SUPPORTED_TOKENS];
  if (!tokens) return undefined;
  
  return Object.values(tokens).find(
    token => token.address.toLowerCase() === address.toLowerCase()
  );
}

export function isTokenSupported(network: string, tokenSymbol: string): boolean {
  const tokens = SUPPORTED_TOKENS[network as keyof typeof SUPPORTED_TOKENS];
  return tokens ? tokenSymbol in tokens : false;
}

export function getTokenConfig(network: string, tokenSymbol: string): TokenConfig | undefined {
  const tokens = SUPPORTED_TOKENS[network as keyof typeof SUPPORTED_TOKENS];
  return tokens ? tokens[tokenSymbol as keyof typeof tokens] : undefined;
}
