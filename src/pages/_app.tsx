import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
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
        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
        environmentId: "62f84955-9b9e-414f-ac3e-c696e48b3aa8",
        walletConnectors: [SolanaWalletConnectors],
      }}
    >
      <DynamicWidget />
      <Component {...pageProps} />
    </DynamicComponent>
  );
}
