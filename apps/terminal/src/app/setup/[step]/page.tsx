import { notFound } from "next/navigation";

import { SetupStepScreen } from "@/components/Setup/SetupStepScreen";
import { isSetupStepId, SETUP_STEP_IDS } from "@/features/setup/steps/routes";

type SetupStepPageProps = { params: Promise<{ step: string }> };

export function generateStaticParams() {
  return SETUP_STEP_IDS.map(step => ({ step }));
}

export default async function SetupStepPage({ params }: SetupStepPageProps) {
  const { step } = await params;
  if (!isSetupStepId(step)) notFound();

  return <SetupStepScreen stepId={step} />;
}
