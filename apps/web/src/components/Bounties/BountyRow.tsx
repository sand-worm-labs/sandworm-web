import Link from "next/link";

import { listCellClass, listRowClass } from "@/components/Showcase/BoardKit";

import type { Bounty } from "./bounties";
import { BountyChips, BountyReward } from "./BountyParts";
import { SponsorLogo } from "./BountyLogos";

interface BountyRowProps {
  bounty: Bounty;
  href: string;
  actions: React.ReactNode;
}

export const BOUNTY_ROW_HEADERS = [
  "Bounty",
  "Sponsor",
  "Reward",
  "Actions",
] as const;

export const BountyRow = ({ bounty, href, actions }: BountyRowProps) => (
  <tr className={listRowClass}>
    <td className={`${listCellClass} md:max-w-sm`}>
      <Link
        href={href}
        className="text-sm font-medium text-ink-100 dark:text-white hover:underline break-words"
      >
        {bounty.title}
      </Link>
      <div className="mt-2">
        <BountyChips bounty={bounty} />
      </div>
    </td>

    <td className={listCellClass}>
      <p className="flex items-center gap-1.5 text-sm text-ink-400">
        <SponsorLogo sponsor={bounty.sponsor} size={16} />
        {bounty.sponsor}
      </p>
    </td>

    <td className={listCellClass}>
      {bounty.sample && <p className="text-xs text-ink-400">Original reward</p>}
      <BountyReward reward={bounty.reward} size={16} />
    </td>

    <td className={listCellClass}>
      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        {actions}
      </div>
    </td>
  </tr>
);
