import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(
  () => import('@dynamic-labs/sdk-react-core').then((mod) => mod.DynamicContextProvider),
  { ssr: false }
)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DynamicComponent
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [SolanaWalletConnectors],
      }}
    >
      <Component {...pageProps} />
    </DynamicComponent>
  );
}
