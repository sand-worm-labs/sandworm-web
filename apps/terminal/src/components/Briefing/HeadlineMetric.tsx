import clsx from "clsx";
import { TONE_BADGE_CLASSNAME } from "@sandworm/ui/kit/tone";

import type { BriefingDetail } from "@/features/briefing/types";

type HeadlineMetricProps = {
  headline: NonNullable<BriefingDetail["headline"]>;
};

export function HeadlineMetric({ headline }: HeadlineMetricProps) {
  const { value, label, delta } = headline;

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-inputBg px-5 py-[18px] ring-1 ring-inset ring-border-secondary">
      <span className="flex flex-col gap-0.5">
        <span className="text-[32px] font-medium leading-[1.1] text-ink-100">
          {value}
        </span>
        <span className="text-[13px] text-ink-400">{label}</span>
      </span>
      {delta && (
        <span
          className={clsx(
            "mb-1 inline-flex h-6 items-center rounded-md px-[9px] text-xs font-medium",
            TONE_BADGE_CLASSNAME[delta.tone]
          )}
        >
          {delta.text}
        </span>
      )}
    </div>
  );
}
