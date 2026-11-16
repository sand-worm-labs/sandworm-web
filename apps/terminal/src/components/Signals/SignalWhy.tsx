import type { SignalDetail } from "@sandworm/types/terminal";

import { SignalSection } from "./SignalSection";

export function SignalWhy({ facts, gap }: Pick<SignalDetail, "facts" | "gap">) {
  return (
    <SignalSection title="Why we think this">
      <ul className="flex flex-col divide-y divide-border-secondary rounded-[14px] ring-1 ring-inset ring-border-secondary">
        {facts.map(fact => (
          <li
            key={fact.label}
            className="flex items-baseline justify-between gap-4 px-4 py-2.5"
          >
            <span className="flex min-w-0 flex-col">
              <span className="text-sm text-ink-100">{fact.label}</span>
              <span className="text-xs text-ink-400">{fact.source}</span>
            </span>
            <span className="shrink-0 text-sm font-medium text-ink-100">
              {fact.value}
            </span>
          </li>
        ))}
      </ul>
      {gap && <p className="text-xs text-ink-400">To check: {gap}</p>}
    </SignalSection>
  );
}
