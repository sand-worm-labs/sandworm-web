import { Button } from "@sandworm/ui/components/button";

import type { Bounty } from "./bounties";
import { BountyList } from "./BountyList";
import { bountyPrimaryButtonClass } from "./styles";

interface BountyDraftsProps {
  drafts: Bounty[];
  detailHref: (slug: string) => string;
  onFund: (draft: Bounty) => void;
}

export const BountyDrafts = ({
  drafts,
  detailHref,
  onFund,
}: BountyDraftsProps) => {
  if (drafts.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-bold text-ink-100 dark:text-white">
        Your drafts
      </h2>
      <BountyList
        bounties={drafts}
        view="grid"
        detailHref={detailHref}
        renderActions={bounty => (
          <Button
            size="sm"
            className={bountyPrimaryButtonClass}
            onClick={() => onFund(bounty)}
          >
            Fund escrow
          </Button>
        )}
      />
    </section>
  );
};
