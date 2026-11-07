import clsx from "clsx";

import type { Confidence } from "@/types";

const barClassNames: Record<Confidence, string> = {
  High: "w-full",
  Medium: "w-[60%]",
  Low: "w-[30%]",
};

export function ConfidenceMeter({ confidence }: { confidence: Confidence }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-500">
      <span
        aria-hidden="true"
        className="h-1.5 w-[22px] overflow-hidden rounded-[3px] bg-border-secondary"
      >
        <span
          className={clsx("block h-1.5 bg-ink-navy", barClassNames[confidence])}
        />
      </span>
      {confidence}
    </span>
  );
}
