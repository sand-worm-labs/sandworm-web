"use client";

import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";

import { getFullnodeUrl } from "@mysten/sui/client";

import { darkTheme } from "@/styles/themes";

const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl("localnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork="localnet">
      <WalletProvider theme={darkTheme}>{children}</WalletProvider>
    </SuiClientProvider>
  );
}
