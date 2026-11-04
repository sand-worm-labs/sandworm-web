"use client";

import { useSetup } from "../context";
import { getSetupStep } from "../steps";
import type { SetupStepId } from "../steps/routes";
import { getTemplatePreview } from "../template-preview";

import { SetupHeader } from "./SetupHeader";
import { StepFooter } from "./StepFooter";
import { StepIntro } from "./StepIntro";
import { StepProgress } from "./StepProgress";
import { TemplatePreview } from "./TemplatePreview";

export function SetupStepScreen({ stepId }: { stepId: SetupStepId }) {
  const { draft, session } = useSetup();
  const step = getSetupStep(stepId);

  return (
    <div className="flex min-h-screen flex-col bg-page-surface font-body text-[13px] leading-snug text-ink-100">
      <SetupHeader session={session} />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col px-6 py-8 md:px-16 md:pb-8 md:pt-10">
          <div className="flex w-full max-w-[640px] flex-1 flex-col gap-6">
            <StepProgress currentStepId={stepId} />
            <StepIntro
              title={step.title(session)}
              description={step.description(session)}
            />
            <step.Component />
            <StepFooter step={step} />
          </div>
        </main>
        <TemplatePreview
          template={getTemplatePreview(draft.organisation.type)}
          note={step.previewNote({ draft, session })}
        />
      </div>
    </div>
  );
}
