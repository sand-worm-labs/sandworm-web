"use client";

import Image from "next/image";
import { useState } from "react";

import { SPONSOR_DOMAINS, type RewardToken } from "./bounties";

// =====================================
// ⬢ Sponsor Logo
// =====================================
export const SponsorLogo = ({
  sponsor,
  size = 16,
}: {
  sponsor: string;
  size?: number;
}) => {
  const [failed, setFailed] = useState(false);
  const domain = SPONSOR_DOMAINS[sponsor];

  if (!domain || failed) {
    return (
      <span
        style={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          borderRadius: Math.round(size * 0.3),
        }}
        className="flex items-center justify-center font-mono font-semibold shrink-0 select-none bg-base-300 dark:bg-base-700 text-ink-400"
        aria-hidden="true"
      >
        {sponsor.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: Math.round(size * 0.3), flexShrink: 0 }}
      className="object-contain"
    />
  );
};

// =====================================
// ⬢ Token Logo
// =====================================
export const TokenLogo = ({
  token,
  size = 16,
}: {
  token: RewardToken;
  size?: number;
}) => (
  <Image
    src={token.logo}
    alt=""
    width={size}
    height={size}
    title={
      token.arbitrum
        ? `${token.name} (${token.symbol}), available on Arbitrum`
        : `${token.name} (${token.symbol}), not available on Arbitrum`
    }
    className="rounded-full object-contain shrink-0"
  />
);
