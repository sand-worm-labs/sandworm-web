import Link from "next/link";
import { PiTrophy } from "react-icons/pi";

import { Tag } from "@/components/Tag";

import { rewardToken, STATUS_LABEL, type Bounty } from "./bounties";
import { SponsorLogo, TokenLogo } from "./BountyLogos";

// =====================================
// ⬢ Bounty Chips
// =====================================
export const BountyChips = ({
  bounty,
}: {
  bounty: Pick<Bounty, "type" | "status" | "sample">;
}) => (
  <div className="flex flex-wrap items-center gap-1.5">
    <Tag>{bounty.type}</Tag>
    {bounty.status !== "open" && (
      <Tag>{STATUS_LABEL[bounty.status] ?? bounty.status}</Tag>
    )}
    {bounty.sample && (
      <Tag title="Posted by the sponsor outside Sandworm. Listed as an example: Sandworm does not pay its reward.">
        Example
      </Tag>
    )}
  </div>
);

// =====================================
// ⬢ Bounty Winners
// =====================================
export const BountyWinners = ({ winners }: Pick<Bounty, "winners">) => (
  <ul className="space-y-1 text-xs text-ink-400">
    {winners.map(winner => (
      <li key={winner.notebookSlug}>
        {winner.place}:{" "}
        <Link
          href={`/notebooks/${winner.notebookSlug}`}
          className="text-ink-100 dark:text-white hover:underline"
        >
          @{winner.author}
        </Link>
      </li>
    ))}
  </ul>
);

// =====================================
// ⬢ Bounty Reward
// =====================================
export const BountyReward = ({
  reward,
  size,
  className = "text-sm font-semibold",
}: {
  reward: Bounty["reward"];
  size: number;
  className?: string;
}) => {
  const token = rewardToken(reward);
  return (
    <p
      className={`flex items-center gap-1.5 text-ink-100 dark:text-white ${className}`}
    >
      {token && <TokenLogo token={token} size={size} />}
      {reward ?? "Reward set by sponsor"}
    </p>
  );
};

// =====================================
// ⬢ Constants
// =====================================
export const bountyButtonClass = "h-[30px] rounded-lg px-3";
export const bountyPrimaryButtonClass = `${bountyButtonClass} hover:bg-primary-710`;

// =====================================
// ⬢ Bounty Card
// =====================================
interface BountyCardProps {
  bounty: Bounty;
  href: string;
  actions: React.ReactNode;
}

export const BountyCard = ({ bounty, href, actions }: BountyCardProps) => (
  <article className="rounded-3xl bg-base-100 border border-border-secondary dark:border-border-tertiary p-7 flex flex-col h-full font-body">
    <BountyChips bounty={bounty} />

    <h3 className="mt-4 text-[0.95rem] font-bold text-ink-100 dark:text-white">
      <Link href={href} className="hover:underline">
        {bounty.title}
      </Link>
    </h3>
    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
      <SponsorLogo sponsor={bounty.sponsor} size={16} />
      Sponsored by {bounty.sponsor}
    </p>

    <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-400 dark:text-gray-300 line-clamp-2">
      {bounty.summary}
    </p>

    {bounty.winners.length > 0 && (
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-100 dark:text-white mb-1.5">
          <PiTrophy size={14} /> Winners
        </p>
        <BountyWinners winners={bounty.winners} />
      </div>
    )}

    <div className="mt-auto pt-6">
      <div className="pt-5 border-t border-border-secondary dark:border-border-tertiary flex items-end justify-between gap-4">
        <div className="min-w-0">
          {bounty.sample && (
            <p className="text-[11px] text-ink-400 mb-0.5">Original reward</p>
          )}
          <BountyReward reward={bounty.reward} size={18} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={href}
            className="text-xs font-medium text-ink-400 hover:text-ink-100 dark:hover:text-white"
          >
            Details
          </Link>
          {actions}
        </div>
      </div>
    </div>
  </article>
);
