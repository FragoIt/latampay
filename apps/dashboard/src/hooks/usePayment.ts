'use client';

import { useState } from 'react';
import { useSignTypedData, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId, useReadContract } from 'wagmi';
import { parseUnits, keccak256, toHex, encodePacked } from 'viem';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { GATEWAY_ADDRESS, GATEWAY_ABI, ERC20_PERMIT_ABI, TOKEN_ADDRESSES, TOKEN_DECIMALS } from '@/lib/contracts';

interface PaymentParams {
  invoiceId: string;
  amount: number;
  currency: 'USDC' | 'USDT';
  merchantAddress: `0x${string}`;
}

interface PaymentResult {
  txHash: string;
  success: boolean;
}

// Default plan tier (0 = FREE plan with 0.35% fee)
const DEFAULT_PLAN_TIER = 0;

// EIP-2612 Permit domain separator
function getPermitDomain(tokenAddress: `0x${string}`, chainId: number, currency: 'USDC' | 'USDT') {
  return {
    name: currency === 'USDC' ? 'USD Coin' : 'Tether USD',
    version: '2',
    chainId,
    verifyingContract: tokenAddress,
  };
}

// EIP-2612 Permit types
const permitTypes = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

export function usePayment() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'signing' | 'sending' | 'confirming' | 'complete' | 'error'>('idle');

  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();

  // Get the correct addresses based on chain
  const isMainnet = chainId === polygon.id;
  const gatewayAddress = isMainnet ? GATEWAY_ADDRESS.mainnet : GATEWAY_ADDRESS.testnet;
  const tokenAddresses = isMainnet ? TOKEN_ADDRESSES.mainnet : TOKEN_ADDRESSES.testnet;

  async function pay(params: PaymentParams): Promise<PaymentResult | null> {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setStep('signing');

    try {
      const tokenAddress = tokenAddresses[params.currency];
      const decimals = TOKEN_DECIMALS[params.currency] || 6;
      const amountWei = parseUnits(params.amount.toString(), decimals);

      // Generate payment ID from invoice ID
      const paymentId = keccak256(toHex(params.invoiceId)) as `0x${string}`;

      // Set deadline to 30 minutes from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60);

      // Get current nonce for the token
      const nonce = await getNonce(tokenAddress, address);

      // Create permit signature
      const domain = getPermitDomain(tokenAddress, chainId, params.currency);
      const message = {
        owner: address,
        spender: gatewayAddress,
        value: amountWei,
        nonce: nonce,
        deadline: deadline,
      };

      // Sign the permit
      const signature = await signTypedDataAsync({
        domain: domain as any,
        types: permitTypes,
        primaryType: 'Permit',
        message,
      });

      // Extract v, r, s from signature
      const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
      const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
      const v = parseInt(signature.slice(130, 132), 16);

      setStep('sending');

      // Call payWithPermit on the gateway contract
      // Args: paymentId, merchant, amount, token, planTier, deadline, v, r, s
      const txHash = await writeContractAsync({
        address: gatewayAddress,
        abi: GATEWAY_ABI,
        functionName: 'payWithPermit',
        args: [
          paymentId,
          params.merchantAddress,
          amountWei,
          tokenAddress,
          DEFAULT_PLAN_TIER,
          deadline,
          v,
          r,
          s,
        ],
      });

      setStep('confirming');

      // Wait for transaction confirmation
      // Note: The actual waiting is handled by useWaitForTransactionReceipt hook
      // For now we return the hash and let the UI handle confirmation

      setStep('complete');
      setIsLoading(false);

      return {
        txHash,
        success: true,
      };
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Error processing payment');
      setStep('error');
      setIsLoading(false);
      return null;
    }
  }

  // Helper function to get nonce - would need to be implemented with useReadContract
  async function getNonce(tokenAddress: `0x${string}`, owner: `0x${string}`): Promise<bigint> {
    // For now return 0 - in production this should read from the contract
    // This is a simplification; real implementation needs useReadContract
    return 0n;
  }

  return {
    pay,
    isLoading,
    error,
    step,
    setError,
    reset: () => {
      setStep('idle');
      setError(null);
      setIsLoading(false);
    },
  };
}

// Hook to read token nonce for permit
export function useTokenNonce(tokenAddress: `0x${string}` | undefined, owner: `0x${string}` | undefined) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_PERMIT_ABI,
    functionName: 'nonces',
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!tokenAddress && !!owner,
    },
  });
}

// Hook to check token balance
export function useTokenBalance(tokenAddress: `0x${string}` | undefined, owner: `0x${string}` | undefined) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_PERMIT_ABI,
    functionName: 'balanceOf',
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!tokenAddress && !!owner,
    },
  });
}
