import { Card } from "@/components/Card";
import { ProgressMeter } from "@/components/ProgressMeter";

import type { Allowance, AllowanceMeter } from "../types";

function MeterCell({
  label,
  meter,
  tone,
}: {
  label: string;
  meter: AllowanceMeter;
  tone: "brand" | "navy";
}) {
  return (
    <div className="flex flex-col gap-2 px-6 py-[18px]">
      <span className="flex justify-between gap-2">
        <span className="font-medium">{label}</span>
        <span className="text-ink-500">
          <span className="font-medium text-ink-100">{meter.used}</span> of{" "}
          {meter.total} used
        </span>
      </span>
      <ProgressMeter value={meter.used} max={meter.total} tone={tone} />
    </div>
  );
}

export function AllowanceSummary({ allowance }: { allowance: Allowance }) {
  return (
    <Card
      aria-label="This quarter's allowance"
      className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] divide-border-secondary overflow-hidden md:divide-x"
    >
      <MeterCell
        label="Research requests"
        meter={allowance.research}
        tone="brand"
      />
      <div className="flex flex-col justify-center gap-0.5 px-6 py-[18px]">
        <span className="font-medium">Resets {allowance.resetsOn}</span>
        <span className="text-xs text-ink-400">
          Research counts once you approve its scope. Written questions
          don&apos;t use your allowance.
        </span>
      </div>
    </Card>
  );
}
