import clsx from "clsx";
import type { BriefingKindId } from "@sandworm/types/terminal";

import { KIND_LABEL } from "@/lib/briefing/display";

const kindClassNames: Record<BriefingKindId, string> = {
  analysis: "bg-info-tint dark:bg-base-600 text-ink-navy",
  signal:
    "bg-primary-tint-75 dark:bg-primary-910 text-primary-700 dark:text-primary-200",
  metric: "bg-base-600 text-ink-500",
};

export function BriefingKindTag({ kind }: { kind: BriefingKindId }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[22px] items-center justify-self-start whitespace-nowrap rounded-md px-2 text-xs font-medium",
        kindClassNames[kind]
      )}
    >
      {KIND_LABEL[kind]}
    </span>
  );
}
