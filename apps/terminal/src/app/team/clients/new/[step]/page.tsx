import { notFound } from "next/navigation";

import { TeamStepScreen } from "@/components/Team/TeamStepScreen";
import { isTeamStepId, TEAM_STEP_IDS } from "@/features/team/routes";

type NewClientStepProps = { params: Promise<{ step: string }> };

export function generateStaticParams() {
  return TEAM_STEP_IDS.map(step => ({ step }));
}

export default async function NewClientStep({ params }: NewClientStepProps) {
  const { step } = await params;
  if (!isTeamStepId(step)) notFound();

  return <TeamStepScreen stepId={step} />;
}
