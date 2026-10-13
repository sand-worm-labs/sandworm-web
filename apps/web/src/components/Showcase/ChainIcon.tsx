"use client";

// Chain badges: the chain's real logo, or its initial on a disc in its color when we do not
// have the logo yet. Colors come from the Showcase config
// (ShowcaseConfig.chains), handed down through ChainColors.
import { createContext, useContext } from "react";

import { cn } from "@/lib/utils";

// =====================================
// ⬢  Constants
// =====================================
export const ChainColors = createContext<Record<string, { color: string }>>({});
const FALLBACK_COLOR = "#6B7280";

// The real logo of each chain, in public/img/chains. They carry their own background and
// shape, so they replace the colored disc. A chain without one (a new row in the studio)
// shows its initial on its color until its logo is added here.
export const CHAIN_LOGOS: Record<string, string> = {
  Arbitrum: "/img/chains/arbitrum.png",
  Avalanche: "/img/chains/avalanche.png",
  Base: "/img/chains/base.png",
  "BNB Chain": "/img/chains/bnb-chain.png",
  Ethereum: "/img/chains/ethereum.png",
  Monad: "/img/chains/monad.png",
  Optimism: "/img/chains/optimism.png",
  Polygon: "/img/chains/polygon.png",
  Solana: "/img/chains/solana.png",
  Sui: "/img/chains/sui.png",
  Tron: "/img/chains/tron.png",
};

// =====================================
// ⬢  ChainIcon
// =====================================
export function ChainIcon({
  chain,
  size = 18,
  className,
}: {
  chain: string;
  size?: number;
  className?: string;
}) {
  const color = useContext(ChainColors)[chain]?.color ?? FALLBACK_COLOR;
  const logo = CHAIN_LOGOS[chain];

  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={chain}
        title={chain}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <svg
      role="img"
      aria-label={chain}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn("shrink-0 rounded-full", className)}
    >
      <title>{chain}</title>
      <circle cx="12" cy="12" r="12" fill={color} />
      <text
        x="12"
        y="16.2"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#fff"
        fontFamily="inherit"
      >
        {chain.charAt(0).toUpperCase()}
      </text>
    </svg>
  );
}

// =====================================
// ⬢  ChainBadge
// =====================================
// One chain's badge with the Showcase config's colors, for a server-rendered page that
// has no ChainColors provider of its own.
export function ChainBadge({
  chain,
  colors,
  size,
  className,
}: {
  chain: string;
  colors: Record<string, { color: string }>;
  size?: number;
  className?: string;
}) {
  return (
    <ChainColors.Provider value={colors}>
      <ChainIcon chain={chain} size={size} className={className} />
    </ChainColors.Provider>
  );
}

// =====================================
// ⬢  ChainStack
// =====================================
// A row of badges, with a count for the ones that do not fit.
export function ChainStack({
  chains,
  max = 5,
}: {
  chains: string[];
  max?: number;
}) {
  const shown = chains.slice(0, max);
  const extra = chains.length - shown.length;

  if (chains.length === 0) return null;

  return (
    <span
      className="inline-flex items-center"
      title={chains.join(", ")}
      aria-label={chains.join(", ")}
    >
      {shown.map((chain, index) => (
        <ChainIcon
          key={chain}
          chain={chain}
          className={cn(index > 0 && "ml-1")}
        />
      ))}
      {extra > 0 && (
        <span className="ml-1.5 font-body-mono text-[10px] text-ink-300">
          +{extra}
        </span>
      )}
    </span>
  );
}
