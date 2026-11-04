"use client";

import { SetupHeader } from "@/features/setup/components/SetupHeader";
import { StepIntro } from "@/features/setup/components/StepIntro";
import { StepProgress } from "@/features/setup/components/StepProgress";
import { TemplatePreview } from "@/features/setup/components/TemplatePreview";
import { getTemplatePreview } from "@/features/setup/template-preview";

import { useTeamClient } from "../context";
import { TEAM_CLIENTS_PATH, teamStepPath, type TeamStepId } from "../routes";
import { getTeamStep, TEAM_STEPS } from "../steps";

import { TeamStepFooter } from "./TeamStepFooter";

export function TeamStepScreen({ stepId }: { stepId: TeamStepId }) {
  const { draft, account } = useTeamClient();
  const step = getTeamStep(stepId);

  return (
    <div className="flex min-h-screen flex-col bg-page-surface font-body text-[13px] leading-snug text-ink-100">
      <SetupHeader
        account={account}
        exit={{ label: "Cancel", href: TEAM_CLIENTS_PATH }}
      />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col px-6 py-8 md:px-16 md:pb-8 md:pt-10">
          <div className="flex w-full max-w-[640px] flex-1 flex-col gap-6">
            <StepProgress
              label="New client steps"
              steps={TEAM_STEPS}
              currentId={stepId}
              pathFor={id => teamStepPath(id as TeamStepId)}
            />
            <StepIntro title={step.title} description={step.description} />
            <step.Component />
            <TeamStepFooter step={step} />
          </div>
        </main>
        <TemplatePreview
          template={getTemplatePreview(draft.details.type)}
          note={step.previewNote(draft)}
        />
      </div>
    </div>
  );
}
