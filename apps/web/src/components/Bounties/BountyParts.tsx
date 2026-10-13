import Link from "next/link";

import { Tag } from "@/components/Tag";

import { STATUS_LABEL, type Bounty } from "./bounties";
import { TokenLogo } from "./BountyLogos";
import { rewardToken } from "./tokens";

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

const winnerNameClass = "text-ink-100 dark:text-white";

export const BountyWinners = ({ winners }: Pick<Bounty, "winners">) => (
  <ul className="space-y-1 text-xs text-ink-400">
    {winners.map(winner => (
      <li key={winner.address ?? winner.notebookSlug}>
        {winner.place}:{" "}
        {winner.notebookSlug ? (
          <Link
            href={`/notebooks/${winner.notebookSlug}`}
            className={`${winnerNameClass} hover:underline`}
          >
            @{winner.author}
          </Link>
        ) : (
          <span className={winnerNameClass}>{winner.author}</span>
        )}
        {winner.amount && ` · ${winner.amount}`}
      </li>
    ))}
  </ul>
);
