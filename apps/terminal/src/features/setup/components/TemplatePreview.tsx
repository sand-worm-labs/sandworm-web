import { Pill } from "@/components/Pill";

import type { TemplateBlueprint } from "../options/organisation-types";

type TemplatePreviewProps = { template: TemplateBlueprint; note: string };

export function TemplatePreview({ template, note }: TemplatePreviewProps) {
  return (
    <aside
      aria-label="Preview of your Terminal"
      className="hidden w-[560px] shrink-0 flex-col gap-3.5 border-l border-border-secondary bg-inputBg px-12 py-10 lg:flex"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink-400">
          Your Terminal will start like this
        </span>
        <Pill>{template.name} template</Pill>
      </div>
      <div className="flex flex-col gap-3 rounded-[18px] border border-hover-border bg-page-surface p-[18px] shadow-md">
        <span className="text-base font-semibold text-ink-100">Overview</span>
        <div className="grid grid-cols-2 gap-2">
          {template.kpis.map(kpi => (
            <div
              key={kpi}
              className="flex flex-col gap-1.5 rounded-xl border border-border-secondary bg-block-surface px-3 py-2.5"
            >
              <span className="text-[11px] text-ink-400">{kpi}</span>
              <span className="block h-2.5 w-[56%] rounded-[5px] bg-primary-tint-100" />
            </div>
          ))}
        </div>
        {template.blocks.map(block => (
          <div
            key={block.title}
            className="flex flex-col gap-1.5 rounded-xl border border-border-secondary bg-block-surface p-3"
          >
            <span className="text-xs font-semibold text-ink-100">
              {block.title}
            </span>
            <span className="text-[11px] text-ink-400">{block.summary}</span>
            <div className="flex h-2 overflow-hidden rounded bg-border-secondary">
              <span className="w-[38%] bg-primary" />
              <span className="w-[41%] bg-primary-200" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-400">{note}</p>
    </aside>
  );
}
