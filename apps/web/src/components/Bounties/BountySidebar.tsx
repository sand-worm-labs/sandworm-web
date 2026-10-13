import { PiTrophy } from "react-icons/pi";

import { EscrowPanel } from "@/web3/components/EscrowPanel";
import { FaucetButton } from "@/web3/components/FaucetButton";

import type { BountyDetails } from "./bounties";
import { BountyReward } from "./BountyParts";

const actionsClass =
  "mt-5 flex items-center gap-2 [&>a]:flex-1 [&>button]:flex-1 [&>a]:whitespace-nowrap [&>button]:whitespace-nowrap [&>a]:px-2 [&>button]:px-2";

interface BountySidebarProps {
  bounty: BountyDetails;
  actions: React.ReactNode;
  onChanged: () => void;
  className?: string;
}

export const BountySidebar = ({
  bounty,
  actions,
  onChanged,
  className,
}: BountySidebarProps) => (
  <aside
    className={`rounded-3xl bg-base-100 border border-border-secondary dark:border-border-tertiary p-6 ${className ?? ""}`}
  >
    <p className="text-xs text-ink-400">
      {bounty.sample ? "Original reward" : "Reward"}
    </p>
    <BountyReward
      reward={bounty.reward}
      size={22}
      className="mt-1 text-lg font-bold"
    />

    {bounty.prizes.length > 0 && (
      <ul className="mt-3 space-y-1 text-xs text-ink-400">
        {bounty.prizes.map(prize => (
          <li key={prize} className="flex gap-1.5">
            <PiTrophy size={13} className="mt-0.5 shrink-0" />
            <span>{prize}</span>
          </li>
        ))}
      </ul>
    )}

    <EscrowPanel bounty={bounty} onChanged={onChanged} />

    {!bounty.sample && <FaucetButton rewardToken={bounty.rewardToken} />}

    {actions && <div className={actionsClass}>{actions}</div>}

    <p className="mt-5 text-xs leading-relaxed text-ink-400">
      Starting a bounty creates a notebook for it in your workspace, but you are
      not tied to it. You can start with one notebook and submit another: pick
      any of yours when you submit, and it is published as your entry.
    </p>

    {bounty.sample && (
      <p className="mt-4 rounded-2xl bg-base-300 dark:bg-base-700 p-3 text-xs leading-relaxed text-ink-400">
        {bounty.sponsor} posted this bounty outside Sandworm
        {bounty.postedOn ? ` (${bounty.postedOn})` : ""}. It is listed as an
        example to practise on: Sandworm does not pay its reward.
      </p>
    )}
  </aside>
);
