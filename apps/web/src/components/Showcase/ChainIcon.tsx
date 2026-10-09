"use client";

// Chain badges: a small disc in the chain's color with its mark, or its
// initial when we have not drawn one. Colors come from the Showcase config
// (ShowcaseConfig.chains), handed down through ChainColors.
import { createContext, useContext } from "react";

import { cn } from "@/lib/utils";

// =====================================
// ⬢  Constants
// =====================================
export const ChainColors = createContext<Record<string, { color: string }>>({});
const FALLBACK_COLOR = "#6B7280";

// Simple white marks on a 24 by 24 grid, drawn here so they stay crisp at
// badge size. A chain without one shows its initial.
const MARKS: Record<string, React.ReactNode> = {
  Solana: (
    <g fill="#fff">
      <path d="M7.6 7.2h10.2l-1.5 1.7H6.1z" />
      <path d="M6.1 11.15h10.2l1.5 1.7H7.6z" />
      <path d="M7.6 15.1h10.2l-1.5 1.7H6.1z" />
    </g>
  ),
  Ethereum: (
    <g fill="#fff">
      <path d="M12 4.5l4.6 7.6L12 14.8l-4.6-2.7z" fillOpacity="0.95" />
      <path d="M12 15.9l4.6-2.7L12 19.5l-4.6-6.3z" fillOpacity="0.7" />
    </g>
  ),
  Base: (
    <path
      fill="#fff"
      d="M12 6a6 6 0 1 1-5.97 6.6h7.6v-1.2h-7.6A6 6 0 0 1 12 6z"
    />
  ),
  Arbitrum: (
    <g fill="#fff">
      <path d="M11 7.2h2l4 9.6h-2z" />
      <path d="M8.6 12.6l1 2.4-1 1.8h-1.9z" fillOpacity="0.75" />
    </g>
  ),
  Monad: (
    <rect
      x="7.6"
      y="7.6"
      width="8.8"
      height="8.8"
      rx="2.7"
      transform="rotate(45 12 12)"
      fill="none"
      stroke="#fff"
      strokeWidth="2.3"
    />
  ),
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
  const mark = MARKS[chain];

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
      {mark ?? (
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
      )}
    </svg>
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
