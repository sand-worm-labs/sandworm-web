import { buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { ProgressMeter } from "@sandworm/ui/kit/progress-meter";

import { SectionHeader } from "@/features/sections/SectionHeader";
import { AppLink } from "@/components/AppLink";

import { BLOCK_ABOUT } from "./blocks/catalogue";
import { AnalystPanel } from "./components/AnalystPanel";
import { SetupChecklist } from "./components/SetupChecklist";
import { findBlock, type OverviewData } from "./types";

type OverviewSettingUpProps = { data: OverviewData; firstName: string };

export function OverviewSettingUp({ data, firstName }: OverviewSettingUpProps) {
  const { setup } = data;
  const analystBlock = findBlock(data.blocks, "analyst");
  const doneCount = setup.steps.filter(step => step.isDone).length;
  const previews = data.blocks.flatMap(block => {
    const about = BLOCK_ABOUT[block._tag];
    return about ? [{ id: block.id, title: block.title, ...about }] : [];
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        current="overview"
        title="Overview"
        subtitle="Setup in progress. Your analyst is checking what we track."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card
          aria-labelledby="setup-welcome"
          className="flex flex-col gap-[18px] px-7 pb-5 pt-7 lg:col-span-2"
        >
          <div>
            <span className="text-sm text-ink-400">Welcome, {firstName}</span>
            <h2
              id="setup-welcome"
              className="mt-1 text-[22px] font-medium leading-tight text-ink-100"
            >
              Your Terminal is being set up
            </h2>
            <p className="mt-1.5 max-w-[560px] text-sm text-ink-500">
              {setup.message}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex-1">
              <ProgressMeter value={doneCount} max={setup.steps.length} />
            </div>
            <span className="whitespace-nowrap text-xs text-ink-400">
              {doneCount} of {setup.steps.length} done
            </span>
          </div>
          <SetupChecklist steps={setup.steps} />
        </Card>
        {analystBlock && (
          <AnalystPanel
            id="setup-analyst"
            title={analystBlock.title}
            analyst={analystBlock.analyst}
            message={setup.kickoffMessage}
            actionLabel="Change the time"
          />
        )}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-medium text-ink-100">
            What you&apos;ll see here
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-400">
            These blocks fill in once your numbers are checked.
          </p>
        </div>
        <AppLink
          route="report"
          className={buttonClassName({
            variant: "link",
            className: "font-medium",
          })}
        >
          See a sample report
        </AppLink>
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {previews.map(preview => (
          <div
            key={preview.id}
            className="flex min-h-[150px] flex-col gap-2 rounded-[22px] border-[1.5px] border-dashed border-hover-border bg-block-surface p-5"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink-100">
                {preview.title}
              </span>
              <span className="inline-flex h-[22px] items-center whitespace-nowrap rounded-md bg-hover-bg px-2 text-xs text-ink-400">
                {preview.cadence}
              </span>
            </span>
            <span className="text-ink-400">{preview.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
