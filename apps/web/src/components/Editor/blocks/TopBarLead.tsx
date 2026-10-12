import React from "react";

interface Props {
  viewing: boolean;
  title: string;
  /** NotebookTypeMenu slot; omitted on the read-only viewer. */
  typeMenu?: React.ReactNode;
}

// Live "Viewing / Editing" pill + runtime menu + title, shared by every top bar.
export function TopBarLead({ viewing, title, typeMenu }: Props) {
  return (
    <div className="w-full min-w-0 overflow-hidden flex items-center gap-x-1.5 text-[13px] text-ink-400 font-body">
      <span className="w-full min-w-0 flex gap-x-2 items-center">
        <span className="font-normal bg-base-600 rounded-full px-3 py-0.5 text-ink-100 border border-border-secondary flex gap-x-2 w-[90px] shrink-0 items-center">
          <span className="relative flex items-center justify-center w-[10px] h-[10px]">
            <span className="absolute inline-flex w-full h-full rounded-full bg-primary/15" />
            <span className="absolute inline-flex w-full h-full animate-[ping_1.8s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-primary/30" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
          </span>
          <span className={viewing ? "text-ink-100" : undefined}>
            {viewing ? "Viewing" : "Editing"}
          </span>
        </span>
        {typeMenu}
        <span className="text-ink-400 truncate min-w-0">/ {title}</span>
      </span>
    </div>
  );
}
