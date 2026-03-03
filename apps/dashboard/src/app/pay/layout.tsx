import { Web3Provider } from '@/lib/wagmi';

export default function PayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  );
}
