import { ethers } from 'ethers';
import { SUPPORTED_TOKENS } from '../constants/tokens';

export class TokenValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public remediation?: string
  ) {
    super(message);
    this.name = 'TokenValidationError';
  }
}

export interface ValidationResult {
  valid: boolean;
  token: {
    address: string;
    symbol: string;
    decimals: number;
    supportsPermit: boolean;
  };
  balance: bigint;
  allowance: bigint;
}

/**
 * Normalize token symbol (USDC, USDC.e, usdc → USDC)
 */
export function normalizeToken(
  symbol: string,
  chain: 'polygon' | 'polygon-mumbai'
): string {
  const normalized = symbol.toUpperCase();
  
  // Check aliases
  const aliases: Record<string, string> = {
    'USDC': 'USDC',
    'USDC.E': 'USDC.e',
    'USDCE': 'USDC.e',
    'USDT': 'USDT'
  };
  
  const result = aliases[normalized];
  if (!result) {
    throw new TokenValidationError(
      `Token ${symbol} no soportado`,
      'UNSUPPORTED_TOKEN',
      'Usa USDC, USDC.e o USDT'
    );
  }
  
  return result;
}

/**
 * Validate token and get info
 */
export async function validateToken(
  tokenSymbol: string,
  chain: 'polygon' | 'polygon-mumbai',
  provider: ethers.Provider
): Promise<ValidationResult['token']> {
  // Normalize
  const normalized = normalizeToken(tokenSymbol, chain);
  
  // Get token config
  const config = SUPPORTED_TOKENS[chain][normalized as keyof typeof SUPPORTED_TOKENS[typeof chain]];
  if (!config) {
    throw new TokenValidationError(
      `Token ${normalized} no configurado para ${chain}`,
      'TOKEN_NOT_CONFIGURED'
    );
  }
  
  // Verify decimals on-chain
  const token = new ethers.Contract(
    config.address,
    ['function decimals() view returns (uint8)'],
    provider
  );
  
  const actualDecimals = await token.decimals();
  if (actualDecimals !== config.decimals) {
    throw new TokenValidationError(
      `Token decimales mismatch: esperado ${config.decimals}, actual ${actualDecimals}`,
      'DECIMALS_MISMATCH'
    );
  }
  
  return {
    address: config.address,
    symbol: normalized,
    decimals: config.decimals,
    supportsPermit: config.supportsPermit
  };
}

/**
 * Pre-flight checks before payment
 */
export async function preFlightCheck(
  userAddress: string,
  tokenAddress: string,
  spenderAddress: string,
  requiredAmount: bigint,
  provider: ethers.Provider
): Promise<ValidationResult> {
  const token = new ethers.Contract(
    tokenAddress,
    [
      'function balanceOf(address) view returns (uint256)',
      'function allowance(address,address) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ],
    provider
  );
  
  // Parallel queries
  const [balance, allowance, decimals, symbol] = await Promise.all([
    token.balanceOf(userAddress),
    token.allowance(userAddress, spenderAddress),
    token.decimals(),
    token.symbol()
  ]);
  
  // Validations
  if (balance < requiredAmount) {
    throw new TokenValidationError(
      `Balance insuficiente: tienes ${ethers.formatUnits(balance, decimals)} ${symbol}, necesitas ${ethers.formatUnits(requiredAmount, decimals)}`,
      'INSUFFICIENT_BALANCE',
      `Compra más ${symbol} en Binance o Coinbase`
    );
  }
  
  // Note: allowance check solo si NO usamos permit
  
  return {
    valid: true,
    token: {
      address: tokenAddress,
      symbol,
      decimals: Number(decimals),
      supportsPermit: false // Detectar después
    },
    balance,
    allowance
  };
}
