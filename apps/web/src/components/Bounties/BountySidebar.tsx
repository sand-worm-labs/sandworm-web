import { PiTrophy } from "react-icons/pi";

import { Tag } from "@/components/Tag";
import { EscrowPanel } from "@/web3/components/EscrowPanel";
import { FaucetButton } from "@/web3/components/FaucetButton";

import { formatPrize, ordinalPlace, type BountyDetails } from "./bounties";
import { BountyReward } from "./BountyParts";

const actionsClass =
  "mt-6 flex items-center gap-2 [&>a]:flex-1 [&>button]:flex-1 [&>a]:whitespace-nowrap [&>button]:whitespace-nowrap [&>a]:px-2 [&>button]:px-2";

interface BountySidebarProps {
  bounty: BountyDetails;
  // Start, submit and the like. Not shown to the person who created the bounty.
  actions: React.ReactNode;
  onChanged: () => void;
  className?: string;
}

// =====================================
// ⬢ Bounty Sidebar
// =====================================
// The reward first, then what the viewer can do, then the escrow and the test tokens, each
// folded away until it is wanted. It sits on the same surface as the Explore cards.
export const BountySidebar = ({
  bounty,
  actions,
  onChanged,
  className,
}: BountySidebarProps) => {
  // A sponsor does not enter their own bounty.
  const showActions = !bounty.isMine && !!actions;

  return (
    <aside
      className={`rounded-3xl border border-border-secondary bg-base-100 p-6 dark:border-border-tertiary dark:bg-block-surface ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-ink-400 dark:text-white/70">
            {bounty.sample ? "Original reward" : "Reward"}
          </p>
          <BountyReward
            reward={bounty.reward}
            size={28}
            className="mt-1.5 text-2xl font-bold text-ink-100 dark:text-white"
          />
        </div>
        {bounty.isMine && <Tag>Your bounty</Tag>}
      </div>

      {bounty.prizeTiers.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-xs">
          {bounty.prizeTiers.map(tier => (
            <li
              key={tier.place}
              className="flex items-center justify-between gap-3 text-ink-400 dark:text-white/75"
            >
              <span className="flex items-center gap-1.5">
                <PiTrophy size={13} className="shrink-0" />
                {ordinalPlace(tier.place)} place
              </span>
              <span className="font-medium tabular-nums text-ink-100 dark:text-white">
                {formatPrize(tier.amount)} {bounty.rewardToken}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        bounty.prizes.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-xs text-ink-400 dark:text-white/75">
            {bounty.prizes.map(prize => (
              <li key={prize} className="flex gap-1.5">
                <PiTrophy size={13} className="mt-0.5 shrink-0" />
                <span>{prize}</span>
              </li>
            ))}
          </ul>
        )
      )}

      {showActions && (
        <>
          <div className={actionsClass}>{actions}</div>
          <p className="mt-3 text-xs leading-relaxed text-ink-400 dark:text-white/65">
            Start opens a new notebook for this bounty. Already have one? Submit
            it instead: any notebook of yours can be your entry.
          </p>
        </>
      )}

      <EscrowPanel bounty={bounty} onChanged={onChanged} />

      {!bounty.sample && <FaucetButton rewardToken={bounty.rewardToken} />}

      {bounty.sample && (
        <p className="mt-5 rounded-2xl border border-border-secondary p-3 text-xs leading-relaxed text-ink-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70">
          {bounty.sponsor} posted this bounty outside Sandworm
          {bounty.postedOn ? ` (${bounty.postedOn})` : ""}. It is listed as an
          example to practise on: Sandworm does not pay its reward.
        </p>
      )}
    </aside>
  );
};
