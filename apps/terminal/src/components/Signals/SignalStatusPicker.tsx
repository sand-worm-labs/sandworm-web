import { cn } from "@sandworm/ui/lib/utils";

import type { SignalStatus } from "@/types";

import { SignalStatusIcon } from "./SignalStatusIcon";

// Every signal starts as New; the client moves it on with one of these
const DECISIONS = [
  { status: "Looking into it", hint: "We'll look into it" },
  { status: "Acting on it", hint: "We're acting on it" },
  { status: "Not for us", hint: "Not a fit for us" },
] as const satisfies readonly { status: SignalStatus; hint: string }[];

type SignalStatusPickerProps = {
  value: SignalStatus;
  onChange: (status: SignalStatus) => void;
};

export function SignalStatusPicker({
  value,
  onChange,
}: SignalStatusPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-ink-400">
        What will you do with this signal?
      </span>
      <div
        role="radiogroup"
        aria-label="What you will do with this signal"
        className="grid grid-cols-1 gap-2 sm:grid-cols-3"
      >
        {DECISIONS.map(({ status, hint }) => {
          const isSelected = status === value;
          return (
            <button
              key={status}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(status)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-[14px] border p-3 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary-tint-75 ring-1 ring-primary dark:bg-primary-910"
                  : "border-hover-border bg-block-surface hover:bg-hover-bg dark:hover:bg-sidebar-hover"
              )}
            >
              <SignalStatusIcon status={status} className="mt-0" />
              <span className="flex flex-col gap-0.5">
                <span className="text-[13px] font-medium text-ink-100">
                  {status}
                </span>
                <span className="text-xs text-ink-400">{hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
