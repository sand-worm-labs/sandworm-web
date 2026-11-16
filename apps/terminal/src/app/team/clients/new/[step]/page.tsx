import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getTeamStep } from "@/components/Team/steps";
import { TeamStepScreen } from "@/components/Team/TeamStepScreen";
import { pageMetadata } from "@/lib/metadata";
import { isTeamStepId, TEAM_STEP_IDS } from "@/lib/team/routes";

type NewClientStepProps = { params: Promise<{ step: string }> };

export function generateStaticParams() {
  return TEAM_STEP_IDS.map(step => ({ step }));
}

export async function generateMetadata({
  params,
}: NewClientStepProps): Promise<Metadata> {
  const { step } = await params;
  if (!isTeamStepId(step)) return {};

  return pageMetadata(`New client · ${getTeamStep(step).label}`);
}

export default async function NewClientStep({ params }: NewClientStepProps) {
  const { step } = await params;
  if (!isTeamStepId(step)) notFound();

  return <TeamStepScreen stepId={step} />;
}
