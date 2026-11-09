import type { SignalDetail } from "@sandworm/types/terminal";

import { SubjectAvatar } from "@/components/Subject/SubjectAvatar";

import { SignalSection } from "./SignalSection";

export function SignalEntities({ entities }: Pick<SignalDetail, "entities">) {
  return (
    <SignalSection title="Who it involves">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {entities.map(entity => (
          <li
            key={entity.name}
            className="flex items-center gap-3 rounded-[14px] p-3 ring-1 ring-inset ring-border-secondary"
          >
            <SubjectAvatar name={entity.name} icon={entity.icon} />
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-ink-100">
                {entity.name}
                <span className="font-normal text-ink-400">
                  {" "}
                  · {entity.role}
                </span>
              </span>
              <span className="text-xs text-ink-400">{entity.stat}</span>
            </span>
          </li>
        ))}
      </ul>
    </SignalSection>
  );
}
