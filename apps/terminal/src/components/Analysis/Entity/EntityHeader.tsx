import type { ReactNode } from "react";
import { PiArrowsLeftRight, PiGlobeHemisphereWest } from "react-icons/pi";
import { Tag } from "@sandworm/ui/kit/tag";

import type { EntityKind } from "@/types";

const tileContent: Record<EntityKind, (name: string) => ReactNode> = {
  project: name => (
    <span className="text-[22px] font-medium">{name.charAt(0)}</span>
  ),
  region: () => <PiGlobeHemisphereWest size={26} />,
  sector: () => <PiArrowsLeftRight size={26} />,
};

type EntityHeaderProps = {
  kind: EntityKind;
  name: string;
  tags: readonly string[];
  summary: string;
};

export function EntityHeader({ kind, name, tags, summary }: EntityHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-4">
      <span
        aria-hidden="true"
        className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200"
      >
        {tileContent[kind](name)}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-[26px] font-medium leading-tight text-ink-100">
          {name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          <span className="text-[13px] text-ink-400">{summary}</span>
        </div>
      </div>
    </header>
  );
}
