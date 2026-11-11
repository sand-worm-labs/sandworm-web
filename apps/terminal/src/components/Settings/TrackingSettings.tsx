"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarLoader } from "@sandworm/ui/kit/bar-loader";
import { Button, buttonClassName } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";
import { ChipInput } from "@sandworm/ui/kit/form/chip-input";
import { ToggleChip } from "@sandworm/ui/kit/form/toggle-chip";

import { RegionInput } from "@/components/Setup/RegionInput";
import { ROUTES } from "@/config/routes";
import { GOALS, MAX_GOALS } from "@/data/setup/goals";
import {
  useSaveTerminalSetupMutation,
  useTerminalSetupQuery,
  type TerminalSetupFieldsFragment,
} from "@/generated/graphql";
import { pluralise } from "@/lib/format";

// The loaded setup carries Apollo's __typename, which the input types reject
function pick<T extends object, K extends keyof T>(
  value: T,
  keys: readonly K[]
): Pick<T, K> {
  return Object.fromEntries(keys.map(key => [key, value[key]])) as Pick<T, K>;
}

const CONTRACT_REQUEST = new URLSearchParams({
  question: "Please change the contracts and wallets we track: ",
});

// What the client can change by itself. Contracts and wallets are checked by
// the Sandworm team, so they go through a request.
export function TrackingSettings() {
  const { data, error } = useTerminalSetupQuery();

  if (error) {
    return (
      <p className="text-sm text-ink-400">
        Could not load your settings. Please try again.
      </p>
    );
  }
  return data?.terminalSetup ? (
    <TrackingForm setup={data.terminalSetup} />
  ) : (
    <div className="flex min-h-[40vh] items-center justify-center">
      <BarLoader />
    </div>
  );
}

function TrackingForm({ setup }: { setup: TerminalSetupFieldsFragment }) {
  const router = useRouter();
  const [competitors, setCompetitors] = useState(setup.tracking.competitors);
  const [regions, setRegions] = useState(setup.tracking.regions);
  const [goals, setGoals] = useState(setup.goals.selected);
  const [save, { loading, error }] = useSaveTerminalSetupMutation({
    refetchQueries: ["TerminalOverviewKpis"],
    awaitRefetchQueries: true,
    onCompleted: () => router.push(ROUTES.overview.path),
  });

  const isChanged =
    JSON.stringify([competitors, regions, goals]) !==
    JSON.stringify([
      setup.tracking.competitors,
      setup.tracking.regions,
      setup.goals.selected,
    ]);
  const contracts = setup.tracking.addresses
    .split("\n")
    .filter(line => line.trim()).length;

  return (
    <div className="flex max-w-[720px] flex-col gap-5">
      <Card className="flex flex-col gap-[18px] px-6 py-[22px]">
        <ChipInput
          label="Competitors to compare against"
          values={competitors}
          onChange={setCompetitors}
        />
        <RegionInput
          label="Regions you care about"
          values={regions}
          onChange={setRegions}
        />
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-2 text-[13px] font-medium text-ink-100">
            What you want from Terminal (pick up to {MAX_GOALS})
          </legend>
          <div className="flex flex-wrap gap-2">
            {GOALS.map(goal => {
              const pressed = goals.includes(goal.id);
              return (
                <ToggleChip
                  key={goal.id}
                  pressed={pressed}
                  disabled={!pressed && goals.length >= MAX_GOALS}
                  onToggle={() =>
                    setGoals(
                      pressed
                        ? goals.filter(id => id !== goal.id)
                        : [...goals, goal.id]
                    )
                  }
                >
                  {goal.label}
                </ToggleChip>
              );
            })}
          </div>
        </fieldset>
        <div className="flex items-center justify-end gap-3">
          {error && (
            <span className="text-xs text-red-700 dark:text-red-400">
              Could not save. Please try again.
            </span>
          )}
          <Button
            disabled={!isChanged || loading}
            onClick={() =>
              save({
                variables: {
                  input: {
                    organisation: pick(setup.organisation, [
                      "type",
                      "name",
                      "website",
                      "description",
                    ]),
                    tracking: {
                      ...pick(setup.tracking, [
                        "addresses",
                        "autoDiscover",
                        "shareInternalData",
                      ]),
                      competitors,
                      regions,
                    },
                    goals: { selected: goals },
                    team: {
                      invites: setup.team.invites.map(invite =>
                        pick(invite, ["id", "email", "access"])
                      ),
                    },
                  },
                },
              })
            }
          >
            Save and update my Overview
          </Button>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3 px-6 py-[18px]">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-ink-100">
            Contracts and wallets
          </span>
          <span className="text-xs text-ink-400">
            {pluralise(contracts, "address")} tracked. The Sandworm team checks
            any change before it affects your numbers.
          </span>
        </div>
        <Link
          href={`${ROUTES.newRequest.path}?${CONTRACT_REQUEST}`}
          className={buttonClassName({ variant: "secondary" })}
        >
          Ask for a change
        </Link>
      </Card>
    </div>
  );
}
