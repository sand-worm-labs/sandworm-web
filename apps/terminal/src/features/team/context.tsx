"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { HeaderAccount } from "@/features/auth/account";
import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import { EMPTY_TEAM_CLIENT_DRAFT } from "./defaults";
import { toggleId } from "./draft";
import type { StarterResearch, TeamClientDraft } from "./types";

type Catalogue = Record<OrganisationTypeId, readonly StarterResearch[]>;

type TeamClientContextValue = {
  draft: TeamClientDraft;
  account: HeaderAccount;
  starters: readonly StarterResearch[];
  patchDetails: (values: Partial<TeamClientDraft["details"]>) => void;
  patchTracking: (values: Partial<TeamClientDraft["tracking"]>) => void;
  toggleStarter: (id: string) => void;
  setInviteTiming: (timing: TeamClientDraft["inviteTiming"]) => void;
};

const TeamClientContext = createContext<TeamClientContextValue | null>(null);

const idsFor = (catalogue: Catalogue, type: OrganisationTypeId) =>
  catalogue[type].map(starter => starter.id);

type TeamClientProviderProps = {
  catalogue: Catalogue;
  account: HeaderAccount;
  children: ReactNode;
};

export function TeamClientProvider({
  catalogue,
  account,
  children,
}: TeamClientProviderProps) {
  const [draft, setDraft] = useState<TeamClientDraft>(() => ({
    ...EMPTY_TEAM_CLIENT_DRAFT,
    starterIds: idsFor(catalogue, EMPTY_TEAM_CLIENT_DRAFT.details.type),
  }));
  // Until the team ticks or unticks something, the client type decides what is ticked.
  const hasEditedStarters = useRef(false);

  const patchDetails = useCallback<TeamClientContextValue["patchDetails"]>(
    values => {
      setDraft(current => {
        const details = { ...current.details, ...values };
        const typeChanged = details.type !== current.details.type;

        return {
          ...current,
          details,
          starterIds:
            typeChanged && !hasEditedStarters.current
              ? idsFor(catalogue, details.type)
              : current.starterIds,
        };
      });
    },
    [catalogue]
  );

  const patchTracking = useCallback<TeamClientContextValue["patchTracking"]>(
    values => {
      setDraft(current => ({
        ...current,
        tracking: { ...current.tracking, ...values },
      }));
    },
    []
  );

  const toggleStarter = useCallback((id: string) => {
    hasEditedStarters.current = true;
    setDraft(current => ({
      ...current,
      starterIds: toggleId(current.starterIds, id),
    }));
  }, []);

  const setInviteTiming = useCallback<
    TeamClientContextValue["setInviteTiming"]
  >(inviteTiming => {
    setDraft(current => ({ ...current, inviteTiming }));
  }, []);

  const value = useMemo(
    () => ({
      draft,
      account,
      starters: catalogue[draft.details.type],
      patchDetails,
      patchTracking,
      toggleStarter,
      setInviteTiming,
    }),
    [
      draft,
      account,
      catalogue,
      patchDetails,
      patchTracking,
      toggleStarter,
      setInviteTiming,
    ]
  );

  return (
    <TeamClientContext.Provider value={value}>
      {children}
    </TeamClientContext.Provider>
  );
}

export function useTeamClient(): TeamClientContextValue {
  const context = useContext(TeamClientContext);
  if (!context) {
    throw new Error("useTeamClient must be used inside TeamClientProvider");
  }
  return context;
}
