import { exhaustiveCheck } from "@/lib/exhaustive";

import type { OverviewBlock } from "../types";

import { BriefingCard } from "./BriefingCard";
import { GapsCard } from "./GapsCard";
import { KpisCard } from "./KpisCard";
import { OpportunitiesCard } from "./OpportunitiesCard";

export function BlockRenderer({ block }: { block: OverviewBlock }) {
  switch (block._tag) {
    case "kpis":
      return <KpisCard block={block} />;
    case "briefing":
      return <BriefingCard block={block} />;
    case "opportunities":
      return <OpportunitiesCard block={block} />;
    case "gaps":
      return <GapsCard block={block} />;
    default:
      return exhaustiveCheck(block);
  }
}
