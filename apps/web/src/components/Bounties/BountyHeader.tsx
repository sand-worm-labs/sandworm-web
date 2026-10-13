import type { BountyDetails } from "./bounties";
import { SponsorLogo } from "./BountyLogos";
import { BountyChips } from "./BountyParts";

export const BountyHeader = ({ bounty }: { bounty: BountyDetails }) => (
  <>
    <BountyChips bounty={bounty} />
    <h1 className="mt-3 text-2xl font-bold text-ink-100 dark:text-white">
      {bounty.title}
    </h1>
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
      <SponsorLogo sponsor={bounty.sponsor} size={18} />
      Sponsored by {bounty.sponsor}
      {bounty.postedOn && ` · Posted ${bounty.postedOn}`}
    </p>
    <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-200 dark:text-gray-300">
      {bounty.summary}
    </p>
  </>
);
