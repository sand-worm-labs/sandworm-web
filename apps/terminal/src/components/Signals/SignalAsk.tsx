import { AppLink } from "@/components/AppLink";
import type { Signal } from "@/types";

import { SignalSection } from "./SignalSection";

const FOLLOW_UPS = [
  "How sure are you?",
  "Who else does this?",
  "What would change this?",
  "Something else",
];

// Going deeper is a request with the signal filled in, scoped and approved like any other
export function SignalAsk({ signal }: { signal: Signal }) {
  return (
    <SignalSection title="Want to know more?">
      <div className="flex flex-wrap gap-2">
        {FOLLOW_UPS.map((followUp, index) => (
          <AppLink
            key={followUp}
            route="newRequest"
            query={{
              question: `${signal.title} — ${index < FOLLOW_UPS.length - 1 ? followUp : ""}`,
              ...(signal.subject && { about: signal.subject }),
            }}
            className="inline-flex h-9 items-center rounded-full border border-hover-border bg-block-surface px-3.5 text-[13px] font-medium text-ink-500 transition-colors hover:bg-hover-bg dark:hover:bg-sidebar-hover"
          >
            {followUp}
          </AppLink>
        ))}
      </div>
      <p className="text-xs text-ink-400">
        Opens a request with this signal filled in. You approve the scope before
        it counts toward your allowance.
      </p>
    </SignalSection>
  );
}
