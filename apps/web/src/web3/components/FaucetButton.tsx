"use client";

import { escrowTokens } from "@sandworm/types/escrow";
import { useState } from "react";
import { PiDrop } from "react-icons/pi";
import { parseUnits } from "viem";
import { useAccount, useSwitchChain } from "wagmi";

import { defaultChain, faucets } from "../config";
import { describeError } from "../errors";
import { useMintTestToken } from "../hooks/useMintTestToken";

import { ConnectWalletButton } from "./ConnectWalletButton";

const MINT_WHOLE_TOKENS = "1000";

const buttonClassName =
  "h-[30px] w-full rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-white hover:bg-primary-710";

// =====================================
// ⬢ Faucet Button
// =====================================
// Test tokens so anyone can try a bounty. Testnet only: it mints the bounty's
// reward token (a demo token anyone can mint) and links the gas faucet.
export const FaucetButton = ({
  rewardToken,
}: {
  rewardToken?: string | null;
}) => {
  const chain = defaultChain;
  const { isConnected, chainId: connectedChainId } = useAccount();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { mint, isMinting } = useMintTestToken(chain.id);
  const [error, setError] = useState<string | null>(null);

  const tokens = (escrowTokens[chain.id] ?? []).filter(token => token.demo);
  const token = tokens.find(item => item.symbol === rewardToken) ?? tokens[0];
  const gasFaucets = faucets[chain.id] ?? [];
  if (!chain.testnet || (!token && gasFaucets.length === 0)) return null;

  const run = async () => {
    if (!token) return;
    setError(null);
    try {
      if (connectedChainId !== chain.id)
        await switchChainAsync({ chainId: chain.id });
      await mint(token, parseUnits(MINT_WHOLE_TOKENS, token.decimals));
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <div className="mt-5 rounded-2xl bg-base-300 dark:bg-base-700 p-4">
      <p className="flex items-center gap-1.5 text-xs font-bold text-ink-100 dark:text-white">
        <PiDrop size={14} /> Try it on {chain.name}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-400">
        Get free test tokens to fund or enter a bounty. They have no value.
      </p>

      {token &&
        (isConnected ? (
          <button
            type="button"
            disabled={isMinting || isSwitching}
            onClick={run}
            className={`${buttonClassName} mt-3`}
          >
            {isMinting
              ? "Minting..."
              : `Get ${MINT_WHOLE_TOKENS} test ${token.symbol}`}
          </button>
        ) : (
          <ConnectWalletButton className="mt-3 w-full justify-center" />
        ))}

      {gasFaucets.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs">
          {gasFaucets.map(faucet => (
            <li key={faucet.url}>
              <a
                href={faucet.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {faucet.name}
              </a>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
