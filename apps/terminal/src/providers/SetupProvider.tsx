"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { HeaderAccount } from "@/lib/auth/account";
import type { ChildrenProps, Session, SetupDraft } from "@/types";

type PatchDraft = <Section extends keyof SetupDraft>(
  section: Section,
  values: Partial<SetupDraft[Section]>
) => void;

type SetupContextValue = {
  draft: SetupDraft;
  session: Session;
  account: HeaderAccount;
  patch: PatchDraft;
};

const SetupContext = createContext<SetupContextValue | null>(null);

type SetupProviderProps = ChildrenProps & {
  initialDraft: SetupDraft;
  session: Session;
  account: HeaderAccount;
};

export function SetupProvider({
  initialDraft,
  session,
  account,
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
    () => ({ draft, session, account, patch }),
    [draft, session, account, patch]
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
