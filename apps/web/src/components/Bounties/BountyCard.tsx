import Link from "next/link";
import { PiTrophy } from "react-icons/pi";

import type { Bounty } from "./bounties";
import { BountyChips, BountyReward, BountyWinners } from "./BountyParts";
import { SponsorLogo } from "./BountyLogos";
import { bountyLinkClass } from "./styles";

interface BountyCardProps {
  bounty: Bounty;
  href: string;
  actions: React.ReactNode;
}

export const BountyCard = ({ bounty, href, actions }: BountyCardProps) => (
  <article className="block-active-hover group relative rounded-xl bg-base-100 dark:bg-block-surface border border-border-secondary dark:border-border-tertiary transition-[border-color,box-shadow] duration-150 p-5 flex flex-col h-full font-body">
    <BountyChips bounty={bounty} />

    <h3 className="mt-4 text-base font-semibold leading-snug text-ink-100 dark:text-white">
      <Link href={href} className="hover:underline">
        {bounty.title}
      </Link>
    </h3>
    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
      <SponsorLogo sponsor={bounty.sponsor} size={16} />
      {bounty.sponsor}
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
            <p className="text-xs text-ink-400 mb-1">Original reward</p>
          )}
          <BountyReward reward={bounty.reward} size={18} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href={href} className={bountyLinkClass}>
            Details
          </Link>
          {actions}
        </div>
      </div>
    </div>
  </article>
);
