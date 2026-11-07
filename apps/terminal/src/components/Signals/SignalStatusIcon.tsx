import clsx from "clsx";

import type { SignalStatus } from "@/types";

const statusClassNames: Record<SignalStatus, string> = {
  New: "border-[1.5px] border-dashed border-primary",
  "Looking into it":
    "border-[1.5px] border-ink-navy bg-gradient-to-r from-ink-navy from-50% to-transparent to-50%",
  "Acting on it":
    "border-[1.5px] border-emerald-700 bg-emerald-700 shadow-[inset_0_0_0_3px_white]",
  "Not for us":
    "border-[1.5px] border-current text-ink-400 bg-[linear-gradient(135deg,transparent_45%,currentColor_45%,currentColor_55%,transparent_55%)]",
};

export function SignalStatusIcon({ status }: { status: SignalStatus }) {
  return (
    <span
      role="img"
      aria-label={status}
      className={clsx(
        "mt-[3px] size-3.5 shrink-0 rounded-full",
        statusClassNames[status]
      )}
    />
  );
}
