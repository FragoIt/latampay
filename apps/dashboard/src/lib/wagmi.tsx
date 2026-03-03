'use client';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';

// Removed WalletConnect to avoid SSR issues with indexedDB
// Only using injected (MetaMask) for now
// To add WalletConnect later, initialize it only on client-side

export const wagmiConfig = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [
    injected(),
    // walletConnect({ projectId }), // Commented out due to SSR issues
  ],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
  ssr: true, // Enable SSR support
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable automatic refetching for better SSR behavior
      refetchOnWindowFocus: false,
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
