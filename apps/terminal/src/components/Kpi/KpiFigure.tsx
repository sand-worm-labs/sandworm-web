import { TONE_TEXT_CLASSNAME } from "@sandworm/ui/kit/tone";

import type { Kpi } from "@/types";

export function KpiFigure({ kpi }: { kpi: Kpi }) {
  const { label, value, delta, comparison } = kpi;

  return (
    <div className="flex flex-col gap-1 px-6 py-5">
      <span className="text-[13px] text-ink-400">{label}</span>
      <span className="text-[28px] font-medium leading-[1.15] text-ink-100">
        {value}
      </span>
      <span className="text-xs">
        {delta && (
          <span className={`font-medium ${TONE_TEXT_CLASSNAME[delta.tone]}`}>
            {delta.text}
          </span>
        )}
        {comparison && <span className="text-ink-400"> {comparison}</span>}
      </span>
    </div>
  );
}
