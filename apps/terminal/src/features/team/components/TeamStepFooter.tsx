"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@sandworm/ui/kit/button";

import { createTeamClient } from "../actions";
import { useTeamClient } from "../context";
import { TEAM_CLIENTS_PATH, teamStepPath } from "../routes";
import { getTeamStepNeighbours } from "../steps";
import type { TeamStepDefinition } from "../steps/types";

const CREATE_FAILED =
  "Couldn't create the client. Check you're on the Sandworm team and that the API is running, then try again.";

export function TeamStepFooter({ step }: { step: TeamStepDefinition }) {
  const router = useRouter();
  const { draft } = useTeamClient();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { previous, next } = getTeamStepNeighbours(step.id);

  const create = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const { name } = await createTeamClient(draft);
      router.push(`${TEAM_CLIENTS_PATH}?created=${encodeURIComponent(name)}`);
    } catch {
      setError(CREATE_FAILED);
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-auto flex flex-col gap-3 border-t border-border-secondary pt-5">
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={() =>
            router.push(
              previous ? teamStepPath(previous.id) : TEAM_CLIENTS_PATH
            )
          }
        >
          {previous ? "Back" : "Cancel"}
        </Button>
        <Button
          disabled={isSaving || !step.canContinue(draft)}
          onClick={() => (next ? router.push(teamStepPath(next.id)) : create())}
        >
          {next ? "Continue" : "Create Terminal"}
        </Button>
      </div>
    </div>
  );
}
