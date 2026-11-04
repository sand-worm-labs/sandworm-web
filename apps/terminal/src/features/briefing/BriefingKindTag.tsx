import clsx from "clsx";

import type { BriefingKind } from "./types";

const kindClassNames: Record<BriefingKind, string> = {
  Analysis: "bg-info-tint dark:bg-base-600 text-ink-navy",
  Opportunity:
    "bg-primary-tint-75 dark:bg-primary-910 text-primary-700 dark:text-primary-200",
  Metric: "bg-base-600 text-ink-500",
};

export function BriefingKindTag({ kind }: { kind: BriefingKind }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[22px] items-center justify-self-start whitespace-nowrap rounded-md px-2 text-xs font-medium",
        kindClassNames[kind]
      )}
    >
      {kind}
    </span>
  );
}
