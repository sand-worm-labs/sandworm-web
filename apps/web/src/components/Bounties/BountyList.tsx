import { ListTable } from "@/components/Explore/ListTable";

import type { Bounty } from "./bounties";
import { BountyCard } from "./BountyCard";
import { BOUNTY_ROW_HEADERS, BountyRow } from "./BountyRow";
import { bountyGridClass } from "./styles";

export type BountyView = "grid" | "list";

interface BountyListProps {
  bounties: Bounty[];
  view: BountyView;
  detailHref: (slug: string) => string;
  renderActions: (bounty: Bounty) => React.ReactNode;
}

export const BountyList = ({
  bounties,
  view,
  detailHref,
  renderActions,
}: BountyListProps) => {
  if (view === "list") {
    return (
      <ListTable headers={BOUNTY_ROW_HEADERS}>
        {bounties.map(bounty => (
          <BountyRow
            key={bounty.slug}
            bounty={bounty}
            href={detailHref(bounty.slug)}
            actions={renderActions(bounty)}
          />
        ))}
      </ListTable>
    );
  }

  return (
    <div className={bountyGridClass}>
      {bounties.map(bounty => (
        <BountyCard
          key={bounty.slug}
          bounty={bounty}
          href={detailHref(bounty.slug)}
          actions={renderActions(bounty)}
        />
      ))}
    </div>
  );
};
