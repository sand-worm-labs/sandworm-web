"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { PiCheckCircleFill, PiCircle } from "react-icons/pi";
import { isAddress } from "viem";
import { useAccount } from "wagmi";

import { useSession } from "@/components/Editor/hooks/useAuth";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import { useUserProfile } from "@/components/Editor/hooks/useUser";
import { shortAddress } from "@/web3/format";
import { ConnectWalletButton } from "@/web3/components/ConnectWalletButton";

interface WalletOption {
  address: string;
  label: string;
}

interface PayoutWalletPickerProps {
  value: string;
  onChange: (address: string) => void;
}

// What the profile keeps for a wallet: {chain, address}. Anything that is not an EVM address
// cannot be paid from the escrow, so it is not offered.
const savedWallets = (raw: unknown): WalletOption[] =>
  (Array.isArray(raw) ? raw : []).flatMap(item => {
    const address = typeof item?.address === "string" ? item.address : "";
    if (!isAddress(address)) return [];
    return [
      {
        address,
        label:
          typeof item.chain === "string" && item.chain
            ? item.chain
            : "Saved wallet",
      },
    ];
  });

// =====================================
// ⬢ Payout Wallet Picker
// =====================================
// The wallet a winner is paid to is chosen from the wallets on their profile, or the wallet
// they have connected, never typed. A typo in an address cannot be undone once it is paid.
export const PayoutWalletPicker = ({
  value,
  onChange,
}: PayoutWalletPickerProps) => {
  const workspaceId = useStringQuery("workspace");
  const { address: connected } = useAccount();
  const { user } = useSession({});
  const { user: profile, loading } = useUserProfile({ userId: user?.id ?? "" });

  const options = useMemo(() => {
    const saved = savedWallets(profile?.settings?.wallets);
    const taken = new Set(saved.map(wallet => wallet.address.toLowerCase()));
    return connected && !taken.has(connected.toLowerCase())
      ? [...saved, { address: connected, label: "Connected wallet" }]
      : saved;
  }, [profile?.settings?.wallets, connected]);

  // Start on the first one, unless something already chosen is still on the list.
  useEffect(() => {
    const stillThere = options.some(
      option => option.address.toLowerCase() === value.toLowerCase()
    );
    if (!stillThere) onChange(options[0]?.address ?? "");
  }, [options, value, onChange]);

  const profileHref = workspaceId
    ? `/workspace/${workspaceId}/settings/profile`
    : "/workspace";

  return (
    <div className="mt-4">
      <p
        id="payout-wallet-label"
        className="text-xs font-medium text-ink-100 dark:text-white"
      >
        Wallet to be paid
      </p>

      {options.length > 0 ? (
        <div
          role="radiogroup"
          aria-labelledby="payout-wallet-label"
          className="mt-1.5 space-y-2"
        >
          {options.map(option => {
            const selected =
              option.address.toLowerCase() === value.toLowerCase();
            return (
              <button
                key={option.address}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(option.address)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  selected
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-border hover:border-hover-border dark:border-border-tertiary"
                }`}
              >
                {selected ? (
                  <PiCheckCircleFill className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <PiCircle className="h-4 w-4 shrink-0 text-ink-300" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink-100 dark:text-white">
                    {option.label}
                  </span>
                  <span className="block font-body-mono text-xs text-ink-400 dark:text-white/70">
                    {shortAddress(option.address)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-1.5 rounded-xl border border-dashed border-border p-4 dark:border-border-tertiary">
          <p className="text-sm text-ink-100 dark:text-white">
            {loading ? "Loading your wallets..." : "No wallet to pay yet."}
          </p>
          {!loading && (
            <>
              <p className="mt-1 text-xs leading-relaxed text-ink-400 dark:text-white/70">
                Connect one, or save one on your profile and reopen this.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <ConnectWalletButton />
                <Link
                  href={profileHref}
                  target="_blank"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Add one to your profile
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      <p className="mt-2 text-xs leading-relaxed text-ink-400 dark:text-white/70">
        If your entry wins, the reward is sent to this wallet from the escrow
        contract. Only you and the sponsor can see it.
      </p>
      <Link
        href={profileHref}
        target="_blank"
        className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
      >
        Manage wallets in your profile
      </Link>
    </div>
  );
};
