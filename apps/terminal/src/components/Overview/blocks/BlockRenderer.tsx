import { exhaustiveCheck } from "@/lib/exhaustive";
import type { OverviewBlock } from "@/types";

import { BriefingCard } from "./BriefingCard";
import { CellsCard } from "./CellsCard";
import { GapsCard } from "./GapsCard";
import { KpisCard } from "./KpisCard";
import { SignalsCard } from "./SignalsCard";

export function BlockRenderer({ block }: { block: OverviewBlock }) {
  switch (block._tag) {
    case "kpis":
      return <KpisCard block={block} />;
    case "briefing":
      return <BriefingCard block={block} />;
    case "signals":
      return <SignalsCard block={block} />;
    case "cells":
      return <CellsCard block={block} />;
    case "gaps":
      return <GapsCard block={block} />;
    default:
      return exhaustiveCheck(block);
  }
}
