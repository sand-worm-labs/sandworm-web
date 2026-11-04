"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/Button";

import { saveSetupDraft } from "../actions";
import { useSetup } from "../context";
import { getStepNeighbours } from "../steps";
import { SETUP_COMPLETE_PATH, setupStepPath } from "../steps/routes";
import type { SetupStepDefinition } from "../steps/types";

export function StepFooter({ step }: { step: SetupStepDefinition }) {
  const router = useRouter();
  const { draft } = useSetup();
  const [isSaving, setIsSaving] = useState(false);
  const { previous, next } = getStepNeighbours(step.id);

  const goNext = async () => {
    setIsSaving(true);
    try {
      await saveSetupDraft(draft);
      router.push(next ? setupStepPath(next.id) : SETUP_COMPLETE_PATH);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-secondary pt-5">
      <Button
        variant="secondary"
        className={previous ? undefined : "invisible"}
        onClick={() => previous && router.push(setupStepPath(previous.id))}
      >
        Back
      </Button>
      <Button disabled={isSaving || !step.canContinue(draft)} onClick={goNext}>
        {next ? "Continue" : "Finish setup"}
      </Button>
    </div>
  );
}
