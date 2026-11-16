import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getSetupStep } from "@/components/Setup/steps";
import { SetupStepScreen } from "@/components/Setup/SetupStepScreen";
import { pageMetadata } from "@/lib/metadata";
import { isSetupStepId, SETUP_STEP_IDS } from "@/lib/setup/routes";

type SetupStepPageProps = { params: Promise<{ step: string }> };

export function generateStaticParams() {
  return SETUP_STEP_IDS.map(step => ({ step }));
}

export async function generateMetadata({
  params,
}: SetupStepPageProps): Promise<Metadata> {
  const { step } = await params;
  if (!isSetupStepId(step)) return {};

  return pageMetadata(`Set up · ${getSetupStep(step).label}`);
}

export default async function SetupStepPage({ params }: SetupStepPageProps) {
  const { step } = await params;
  if (!isSetupStepId(step)) notFound();

  return <SetupStepScreen stepId={step} />;
}
