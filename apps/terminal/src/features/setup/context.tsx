"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Session } from "@/features/session/types";

import type { SetupDraft } from "./types";

type PatchDraft = <Section extends keyof SetupDraft>(
  section: Section,
  values: Partial<SetupDraft[Section]>
) => void;

type SetupContextValue = {
  draft: SetupDraft;
  session: Session;
  patch: PatchDraft;
};

const SetupContext = createContext<SetupContextValue | null>(null);

type SetupProviderProps = {
  initialDraft: SetupDraft;
  session: Session;
  children: ReactNode;
};

export function SetupProvider({
  initialDraft,
  session,
  children,
}: SetupProviderProps) {
  const [draft, setDraft] = useState(initialDraft);

  const patch = useCallback<PatchDraft>((section, values) => {
    setDraft(current => ({
      ...current,
      [section]: { ...current[section], ...values },
    }));
  }, []);

  const value = useMemo(
    () => ({ draft, session, patch }),
    [draft, session, patch]
  );

  return (
    <SetupContext.Provider value={value}>{children}</SetupContext.Provider>
  );
}

export function useSetup(): SetupContextValue {
  const context = useContext(SetupContext);
  if (!context) throw new Error("useSetup must be used inside SetupProvider");
  return context;
}
