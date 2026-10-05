"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";

import { defaultChain } from "./config";
import { wagmiConfig } from "./wagmi";

// =====================================
// ⬢ Constants
// =====================================
const themeOptions = {
  accentColor: "#A308F0",
  accentColorForeground: "white",
  borderRadius: "large",
  fontStack: "system",
} as const;

// =====================================
// ⬢ Web3 Provider
// =====================================
export function Web3Provider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      })
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={defaultChain}
          theme={
            resolvedTheme === "dark"
              ? darkTheme({ ...themeOptions, accentColor: "#9355F6" })
              : lightTheme(themeOptions)
          }
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
