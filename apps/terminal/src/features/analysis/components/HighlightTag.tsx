import clsx from "clsx";
import { TONE_BADGE_CLASSNAME } from "@sandworm/ui/kit/tone";

import type { AnalysisHighlight } from "../types";

const tagClassNames: Record<AnalysisHighlight["tag"], string> = {
  "New report": "bg-info-tint dark:bg-base-600 text-ink-navy",
  Delivered: TONE_BADGE_CLASSNAME.positive,
};

export function HighlightTag({ tag }: { tag: AnalysisHighlight["tag"] }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[22px] items-center whitespace-nowrap rounded-md px-2 text-xs font-medium",
        tagClassNames[tag]
      )}
    >
      {tag}
    </span>
  );
}
