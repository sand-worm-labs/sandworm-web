import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";

import { AppLink } from "@/components/AppLink";
import type { BriefingBlock } from "@/types";
import { groupInOrder } from "@/lib/group-in-order";
import { BlockHeader } from "@/components/Overview/BlockHeader";

import { BriefingRow } from "./BriefingRow";

export function BriefingCard({ block }: { block: BriefingBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <Card
      bleed
      aria-labelledby={titleId}
      className="flex h-full flex-col gap-3.5 px-3 pb-3 pt-[22px]"
    >
      <div className="px-3">
        <BlockHeader
          id={titleId}
          title={block.title}
          subtitle={block.subtitle}
          action={
            <AppLink
              route="briefing"
              className={buttonClassName({
                variant: "link",
                className: "whitespace-nowrap font-medium",
              })}
            >
              View all
            </AppLink>
          }
        />
      </div>
      <div className="flex flex-col">
        {groupInOrder(block.entries, entry => entry.group).map(group => (
          <div key={group.key} className="flex flex-col">
            <div className="flex items-center gap-1.5 px-3 pb-1 pt-2.5 text-xs font-medium text-ink-400">
              {group.key}
              <span className="font-normal">{group.items.length}</span>
            </div>
            {group.items.map(entry => (
              <BriefingRow key={entry.id} entry={entry} />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
