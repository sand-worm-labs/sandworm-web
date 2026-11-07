import type { ReactNode } from "react";
import { Card } from "@sandworm/ui/kit/card";

type SectionCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  source?: boolean;
  children: ReactNode;
};

export function SectionCard({
  id,
  title,
  subtitle,
  source = true,
  children,
}: SectionCardProps) {
  const titleId = `${id}-title`;

  return (
    <Card
      aria-labelledby={titleId}
      className="flex flex-col gap-4 px-6 pb-[18px] pt-[22px]"
    >
      <div>
        <h2 id={titleId} className="text-base font-medium text-ink-100">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-ink-400">{subtitle}</p>
        )}
      </div>
      {children}
      {source && (
        <p className="mt-auto text-xs text-ink-400">Source: Sandworm</p>
      )}
    </Card>
  );
}
