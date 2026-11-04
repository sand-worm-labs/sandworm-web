import { Card } from "@sandworm/ui/kit/card";
import { TONE_TEXT_CLASSNAME } from "@sandworm/ui/kit/tone";

import type { EntityKpi } from "../types";

export function KpiStrip({
  label,
  kpis,
}: {
  label: string;
  kpis: readonly EntityKpi[];
}) {
  return (
    <Card
      aria-label={label}
      className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] divide-border-secondary overflow-hidden md:divide-x"
    >
      {kpis.map(item => (
        <div key={item.id} className="flex flex-col gap-1 px-6 py-5">
          <span className="text-[13px] text-ink-400">{item.label}</span>
          <span className="text-[28px] font-medium leading-[1.15] text-ink-100">
            {item.value}
          </span>
          <span className="text-xs">
            {item.delta && (
              <span
                className={`font-medium ${TONE_TEXT_CLASSNAME[item.delta.tone]}`}
              >
                {item.delta.text}
              </span>
            )}
            {item.comparison && (
              <span className="text-ink-400"> {item.comparison}</span>
            )}
          </span>
        </div>
      ))}
    </Card>
  );
}
