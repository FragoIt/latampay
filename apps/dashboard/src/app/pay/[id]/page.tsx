'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useSignTypedData, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { parseUnits, keccak256, toHex, encodePacked } from 'viem';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { GATEWAY_ADDRESS, GATEWAY_ABI, ERC20_PERMIT_ABI, TOKEN_ADDRESSES, TOKEN_DECIMALS } from '@/lib/contracts';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: 'pending' | 'paid' | 'cancelled';
  client_email: string;
  created_at: string;
  payment_id: string | null;
  tx_hash: string | null;
  merchant_address: string | null;
}

type PaymentStatus = 'loading' | 'pending' | 'connecting' | 'ready' | 'signing' | 'processing' | 'paid' | 'error';

// Default plan tier (0 = FREE plan with 0.35% fee)
const DEFAULT_PLAN_TIER = 0;

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

export default function PaymentPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { signTypedDataAsync } = useSignTypedData();
  const { writeContractAsync } = useWriteContract();

  // Local state
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Target chain (use testnet for development)
  const targetChain = process.env.NEXT_PUBLIC_USE_MAINNET === 'true' ? polygon : polygonAmoy;
  const isMainnet = chainId === polygon.id;
  const gatewayAddress = isMainnet ? GATEWAY_ADDRESS.mainnet : GATEWAY_ADDRESS.testnet;
  const tokenAddresses = isMainnet ? TOKEN_ADDRESSES.mainnet : TOKEN_ADDRESSES.testnet;

  // Get token address for current invoice
  const tokenAddress = invoice?.currency === 'USDC' || invoice?.currency === 'USDT' 
    ? tokenAddresses[invoice.currency as 'USDC' | 'USDT']
    : tokenAddresses.USDC;

  // Read nonce for permit
  const { data: nonce } = useReadContract({
    address: tokenAddress,
    abi: ERC20_PERMIT_ABI,
    functionName: 'nonces',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!invoice },
  });

  // Read token balance
  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_PERMIT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!invoice },
  });

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` | undefined,
  });

  // Update status when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && txHash) {
      setStatus('paid');
      // Sync status to backend
      syncPaymentStatus(txHash);
    }
  }, [isConfirmed, txHash]);

  // Fetch invoice data
  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (!res.ok) {
          throw new Error('Invoice not found');
        }
        const data = await res.json();
        setInvoice(data);
        
        if (data.status === 'paid') {
          setStatus('paid');
          if (data.tx_hash) setTxHash(data.tx_hash);
        } else {
          setStatus('pending');
        }
      } catch (err) {
        setError('No se pudo cargar la factura');
        setStatus('error');
      }
    }

    fetchInvoice();
  }, [invoiceId]);

  // Update status when wallet connects
  useEffect(() => {
    if (isConnected && status === 'pending') {
      setStatus('ready');
    }
  }, [isConnected, status]);

  const handleConnectWallet = () => {
    setStatus('connecting');
    connect({ connector: injected() });
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: targetChain.id });
    } catch (err) {
      setError('No se pudo cambiar de red');
    }
  };

  const syncPaymentStatus = async (hash: string) => {
    try {
      await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tx_hash: hash,
          payer_address: address,
          chain_id: chainId,
        }),
      });
    } catch (err) {
      console.error('Failed to sync payment status:', err);
    }
  };

  const handlePay = async () => {
    if (!invoice || !address) return;
    
    // Validate merchant address
    if (!invoice.merchant_address) {
      setError('Esta factura no tiene una dirección de merchant configurada.');
      return;
    }
    
    // Check balance - use proper decimals based on currency
    const decimals = TOKEN_DECIMALS[invoice.currency as keyof typeof TOKEN_DECIMALS] || 6;
    const amountWei = parseUnits(invoice.amount.toString(), decimals);
    
    if (balance && balance < amountWei) {
      setError(`Saldo insuficiente. Necesitas ${invoice.amount} ${invoice.currency}`);
      return;
    }

    setStatus('signing');
    setError(null);
    
    try {
      // Generate payment ID from invoice ID (deterministic)
      const paymentId = keccak256(toHex(invoiceId)) as `0x${string}`;

      // Set deadline to 30 minutes from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60);

      // Create permit signature
      const domain = {
        name: invoice.currency === 'USDC' ? 'USD Coin' : 'Tether USD',
        version: '2',
        chainId,
        verifyingContract: tokenAddress,
      };

      const message = {
        owner: address,
        spender: gatewayAddress,
        value: amountWei,
        nonce: nonce ?? 0n,
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

      setStatus('processing');

      // Call payWithPermit on the gateway contract
      // Args: paymentId, merchant, amount, token, planTier, deadline, v, r, s
      const hash = await writeContractAsync({
        address: gatewayAddress,
        abi: GATEWAY_ABI,
        functionName: 'payWithPermit',
        args: [
          paymentId,
          invoice.merchant_address as `0x${string}`,
          amountWei,
          tokenAddress,
          DEFAULT_PLAN_TIER,
          deadline,
          v,
          r,
          s,
        ],
      });

      setTxHash(hash);
      // Status will be updated to 'paid' when transaction is confirmed via useWaitForTransactionReceipt

    } catch (err: any) {
      console.error('Payment error:', err);
      if (err.message?.includes('User rejected')) {
        setError('Transacción cancelada por el usuario');
      } else if (err.message?.includes('insufficient')) {
        setError('Saldo insuficiente para completar el pago.');
      } else {
        setError('Error al procesar el pago. Intenta de nuevo.');
      }
      setStatus('ready');
    }
  };

  // Check for insufficient balance
  const hasInsufficientBalance = invoice && balance !== undefined && 
    balance < parseUnits(invoice.amount.toString(), 6);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="animate-pulse space-y-4 w-full max-w-lg">
          <div className="h-16 w-16 bg-neutral-200 rounded-full mx-auto"></div>
          <div className="h-8 bg-neutral-200 rounded w-1/2 mx-auto"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error' || !invoice) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Error</h2>
            <p className="text-neutral-500">{error || 'Factura no encontrada'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWrongNetwork = isConnected && chainId !== targetChain.id;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header with LatamPay branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center shadow-lg mb-4">
            <span className="text-2xl font-bold text-white">LP</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">LatamPay</h1>
          <p className="text-neutral-500">Pago Seguro con Stablecoins</p>
        </div>

        <Card className="shadow-strong border-0 overflow-hidden">
          {/* Success Banner */}
          {status === 'paid' && (
            <div className="bg-green-500 text-white p-4 text-center font-bold flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Pago Completado
            </div>
          )}

          <CardHeader className="text-center pb-2">
            <CardDescription className="uppercase tracking-wider text-xs font-semibold">
              Total a Pagar
            </CardDescription>
            <CardTitle className="text-5xl font-black text-neutral-900 mt-2">
              ${invoice.amount.toLocaleString()}
              <span className="text-2xl text-neutral-400 font-medium ml-2">
                {invoice.currency}
              </span>
            </CardTitle>
            {invoice.description && (
              <p className="text-neutral-500 mt-2">{invoice.description}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Invoice Details */}
            <div className="bg-neutral-50 rounded-xl p-4 space-y-3 border border-neutral-100">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Factura #</span>
                <span className="font-medium text-neutral-900 font-mono">
                  {invoice.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Fecha</span>
                <span className="font-medium text-neutral-900">
                  {new Date(invoice.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Estado</span>
                <span className={`font-medium ${
                  status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {status === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Connected Wallet Info */}
            {isConnected && (
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-primary-600 font-medium">Wallet Conectada</p>
                    <p className="font-mono text-sm text-primary-900">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                  <button
                    onClick={() => disconnect()}
                    className="text-xs text-primary-600 hover:text-primary-800 underline"
                  >
                    Desconectar
                  </button>
                </div>
                {/* Token Balance */}
                {balance !== undefined && (
                  <div className="flex items-center justify-between pt-2 border-t border-primary-100">
                    <span className="text-xs text-primary-600">Tu saldo {invoice.currency}</span>
                    <span className={`font-mono text-sm ${hasInsufficientBalance ? 'text-red-600' : 'text-primary-900'}`}>
                      ${(Number(balance) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {hasInsufficientBalance && (
                  <p className="text-xs text-red-600">
                    ⚠️ Saldo insuficiente para este pago
                  </p>
                )}
                {isWrongNetwork && (
                  <p className="text-xs text-orange-600">
                    ⚠️ Red incorrecta. Cambia a {targetChain.name}
                  </p>
                )}
              </div>
            )}

            {/* Payment Status Timeline */}
            {(status === 'signing' || status === 'processing') && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-900">Procesando...</h3>
                <div className="relative pl-4 border-l-2 border-neutral-200 space-y-6">
                  <div className="relative">
                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${
                      status === 'signing' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                    }`}></div>
                    <p className="text-sm font-medium text-neutral-900">
                      {status === 'signing' ? 'Firmando transacción...' : 'Firma completada'}
                    </p>
                  </div>
                  {status === 'processing' && (
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-yellow-500 ring-4 ring-white animate-pulse"></div>
                      <p className="text-sm font-medium text-neutral-900">Confirmando en blockchain...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2 pb-8">
            {/* Connect Wallet Button */}
            {status === 'pending' && !isConnected && (
              <>
                <Button
                  className="w-full h-14 text-lg bg-neutral-900 hover:bg-neutral-800"
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
                </Button>
                <p className="text-xs text-center text-neutral-400">
                  MetaMask, WalletConnect y más
                </p>
              </>
            )}

            {/* Switch Network Button */}
            {isConnected && isWrongNetwork && status !== 'paid' && (
              <Button
                className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600"
                onClick={handleSwitchNetwork}
              >
                Cambiar a {targetChain.name}
              </Button>
            )}

            {/* Pay Button */}
            {status === 'ready' && isConnected && !isWrongNetwork && (
              <Button
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
                onClick={handlePay}
              >
                Firmar y Pagar ${invoice.amount} {invoice.currency}
              </Button>
            )}

            {/* Processing State */}
            {(status === 'signing' || status === 'processing') && (
              <Button
                className="w-full h-14 text-lg"
                disabled
              >
                {status === 'signing' ? 'Firmando...' : 'Confirmando...'}
              </Button>
            )}

            {/* Success State */}
            {status === 'paid' && (
              <>
                <div className="text-center py-4">
                  <p className="text-green-600 font-medium">✓ Pago exitoso</p>
                  {invoice.tx_hash && (
                    <a
                      href={`https://polygonscan.com/tx/${invoice.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline"
                    >
                      Ver en PolygonScan →
                    </a>
                  )}
                </div>
                <Button variant="outline" className="w-full">
                  Descargar Recibo
                </Button>
              </>
            )}

            {/* Error Display */}
            {error && (
              <p className="text-xs text-center text-red-500">{error}</p>
            )}
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-xs text-center text-neutral-400 mt-6">
          Pagos seguros procesados por LatamPay • 0.3% fee
        </p>
      </div>
    </div>
  );
}
