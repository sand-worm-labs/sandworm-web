import { toPercent } from "@sandworm/ui/kit/lib/percent";

const toneClassNames = { brand: "bg-primary", navy: "bg-ink-navy" } as const;

type ProgressMeterProps = {
  value: number;
  max: number;
  tone?: keyof typeof toneClassNames;
};

export function ProgressMeter({
  value,
  max,
  tone = "brand",
}: ProgressMeterProps) {
  return (
    <div
      aria-hidden="true"
      className="h-1.5 overflow-hidden rounded-full bg-primary-tint-75 dark:bg-primary-910"
    >
      <div
        className={`h-1.5 rounded-full ${toneClassNames[tone]}`}
        style={{ width: `${toPercent(value, max)}%` }}
      />
    </div>
  );
}
