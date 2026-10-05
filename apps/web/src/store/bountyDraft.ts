import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// =====================================
// ⬢ Types
// =====================================
export type BountyDraftForm = {
  title: string;
  sponsor: string;
  type: string;
  summary: string;
  details: string;
  amount: string;
  token: string;
  deadline: string;
};

type BountyDraft = { step: number; form: BountyDraftForm };

type BountyDraftState = {
  drafts: Record<string, BountyDraft>;
  update: (workspaceId: string, patch: Partial<BountyDraft>) => void;
  clear: (workspaceId: string) => void;
};

// =====================================
// ⬢ Constants
// =====================================
export const EMPTY_BOUNTY_DRAFT: BountyDraft = {
  step: 0,
  form: {
    title: "",
    sponsor: "",
    type: "Dashboard",
    summary: "",
    details: "",
    amount: "",
    token: "USDG",
    deadline: "",
  },
};

// =====================================
// ⬢ Bounty Draft Store
// =====================================
export const useBountyDraftStore = create<BountyDraftState>()(
  persist(
    set => ({
      drafts: {},
      update: (workspaceId, patch) =>
        set(state => {
          const current = state.drafts[workspaceId] ?? EMPTY_BOUNTY_DRAFT;
          return {
            drafts: {
              ...state.drafts,
              [workspaceId]: {
                step: patch.step ?? current.step,
                form: { ...current.form, ...patch.form },
              },
            },
          };
        }),
      clear: workspaceId =>
        set(state => {
          const { [workspaceId]: _removed, ...rest } = state.drafts;
          return { drafts: rest };
        }),
    }),
    {
      name: "sandworm:bounty-draft",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
