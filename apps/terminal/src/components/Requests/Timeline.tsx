import clsx from "clsx";

import type { StepState, TimelineStep } from "@/lib/requests/types";

const iconClassNames: Record<StepState, string> = {
  done: "border-[1.5px] border-emerald-700 bg-emerald-700 shadow-[inset_0_0_0_3px_white]",
  next: "border-2 border-primary bg-primary-tint-50 dark:bg-primary-910",
  later: "border-[1.5px] border-dashed border-ink-400",
  declined:
    "border-[1.5px] border-red-700 bg-red-700 shadow-[inset_0_0_0_3px_white]",
};

const sizeClassNames = { sm: "size-[18px]", md: "size-[22px]" } as const;

type TimelineProps = {
  label: string;
  steps: readonly TimelineStep[];
  size?: keyof typeof sizeClassNames;
};

export function Timeline({ label, steps, size = "sm" }: TimelineProps) {
  return (
    <ol aria-label={label} className="flex flex-col">
      {steps.map((step, index) => (
        <li
          key={step.id}
          aria-current={step.state === "next" ? "step" : undefined}
          className="grid grid-cols-[auto_minmax(0,1fr)] gap-3"
        >
          <span className="flex flex-col items-center">
            <span
              aria-hidden="true"
              className={clsx(
                "shrink-0 rounded-full",
                sizeClassNames[size],
                iconClassNames[step.state]
              )}
            />
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={clsx(
                  "min-h-[14px] w-0.5 flex-1",
                  step.state === "done"
                    ? "bg-emerald-700"
                    : "bg-border-secondary"
                )}
              />
            )}
          </span>
          <span className="flex flex-col pb-3.5">
            <span className="flex justify-between gap-2">
              <span
                className={
                  step.state === "later"
                    ? "text-ink-400"
                    : "font-medium text-ink-100"
                }
              >
                {step.label}
              </span>
              {step.when && (
                <span className="whitespace-nowrap text-xs text-ink-400">
                  {step.when}
                </span>
              )}
            </span>
            {step.detail && (
              <span className="text-xs text-ink-400">{step.detail}</span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
