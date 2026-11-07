import Image from "next/image";
import { Pill } from "@sandworm/ui/kit/pill";

import type { TemplateBlueprint } from "@/data/setup/organisation-types";

function AuroraBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <Image
        alt=""
        src="/img/abstract.webp"
        fill
        priority
        sizes="560px"
        className="object-cover"
      />
      <video
        className="absolute inset-0 size-full object-cover motion-reduce:hidden"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/img/abstract.webp"
      >
        <source src="/videos/aurora.webm" type="video/webm" />
        <source src="/videos/aurora.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

type TemplatePreviewProps = { template: TemplateBlueprint; note: string };

export function TemplatePreview({ template, note }: TemplatePreviewProps) {
  return (
    <aside
      aria-label="Preview of your Terminal"
      className="relative hidden w-[560px] shrink-0 overflow-hidden lg:block"
    >
      <AuroraBackdrop />
      <div className="relative z-10 flex h-full flex-col gap-3.5 px-12 py-10">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-normal text-white/90">
            Your Terminal will start like this
          </span>
          <Pill tone="glass">{template.name} template</Pill>
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
        <p className="text-xs text-white/80">{note}</p>
      </div>
    </aside>
  );
}
