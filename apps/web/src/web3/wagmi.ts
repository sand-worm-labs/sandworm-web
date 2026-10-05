import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";

import { targetChains, walletConnectProjectId } from "./config";

// =====================================
// ⬢ Wagmi Config
// =====================================
const wallets = [
  metaMaskWallet,
  injectedWallet,
  rainbowWallet,
  ...(walletConnectProjectId ? [walletConnectWallet] : []),
];

// RainbowKit reads the wallet list in the browser only
const connectors =
  typeof window === "undefined"
    ? []
    : connectorsForWallets([{ groupName: "Wallets", wallets }], {
        appName: "Sandworm",
        projectId: walletConnectProjectId || "sandworm-injected-only",
      });

export const wagmiConfig = createConfig({
  chains: targetChains,
  connectors,
  ssr: true,
  transports: Object.fromEntries(
    targetChains.map(chain => [chain.id, http()])
  ) as Record<(typeof targetChains)[number]["id"], ReturnType<typeof http>>,
});
