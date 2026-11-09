import type { SubjectIcon } from "@sandworm/types/terminal";

import { SubjectAvatar } from "@/components/Subject/SubjectAvatar";
import type { EntityKind } from "@/types";

type EntityHeaderProps = {
  kind: EntityKind;
  name: string;
  icon: SubjectIcon | null;
  description: string;
};

export function EntityHeader({
  kind,
  name,
  icon,
  description,
}: EntityHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-4">
      <SubjectAvatar name={name} icon={icon} size="lg" view={kind} />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-[26px] font-medium leading-tight text-ink-100">
          {name}
        </h1>
        <span className="text-[13px] text-ink-400">{description}</span>
      </div>
    </header>
  );
}
