import type { ReactNode } from "react";

type BlockHeaderProps = {
  id: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function BlockHeader({ id, title, subtitle, action }: BlockHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 id={id} className="text-base font-medium text-ink-100">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-ink-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
