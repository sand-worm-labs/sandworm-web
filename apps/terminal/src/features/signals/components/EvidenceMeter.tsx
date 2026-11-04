import clsx from "clsx";

import type { Evidence } from "../types";

const barClassNames: Record<Evidence, string> = {
  Strong: "w-full",
  Some: "w-[60%]",
  Early: "w-[30%]",
};

export const EVIDENCE_LABELS: Record<Evidence, string> = {
  Strong: "Strong evidence",
  Some: "Some evidence",
  Early: "Early sign",
};

export function EvidenceMeter({ evidence }: { evidence: Evidence }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-ink-500">
      <span
        aria-hidden="true"
        className="h-1.5 w-[22px] overflow-hidden rounded-[3px] bg-border-secondary"
      >
        <span
          className={clsx("block h-1.5 bg-ink-navy", barClassNames[evidence])}
        />
      </span>
      {EVIDENCE_LABELS[evidence]}
    </span>
  );
}
