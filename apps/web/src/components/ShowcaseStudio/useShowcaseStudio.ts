"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";

import type { NotebookShowcase, ShowcaseConfig } from "@/types";

// =====================================
// ⬢  Constants
// =====================================
const PASSWORD_KEY = "showcase-studio-password";

const OVERVIEW = gql`
  query ShowcaseStudioOverview($password: String) {
    getShowcaseAdmin(password: $password)
    getShowcaseConfig
  }
`;

const SAVE_NOTEBOOK = gql`
  mutation SaveShowcaseNotebook(
    $documentId: String!
    $showcase: JSON
    $password: String
  ) {
    saveShowcaseNotebook(
      documentId: $documentId
      showcase: $showcase
      password: $password
    )
  }
`;

const SAVE_CATEGORY = gql`
  mutation SaveShowcaseCategory($input: JSON!, $password: String) {
    saveShowcaseCategory(input: $input, password: $password)
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteShowcaseCategory($slug: String!, $password: String) {
    deleteShowcaseCategory(slug: $slug, password: $password)
  }
`;

const SAVE_CHAIN = gql`
  mutation SaveShowcaseChain($input: JSON!, $password: String) {
    saveShowcaseChain(input: $input, password: $password)
  }
`;

const APPROVE_CLAIM = gql`
  mutation ApproveShowcaseClaim($leadId: String!, $password: String) {
    approveShowcaseClaim(leadId: $leadId, password: $password)
  }
`;

// =====================================
// ⬢  Types
// =====================================
export type StudioNotebook = {
  id: string;
  workspaceId: string;
  title: string;
  slug: string;
  description: string | null;
  visibility: string;
  publishedAt: string | null;
  updatedAt: string;
  showcase: NotebookShowcase | null;
};

export type StudioLead = {
  id: string;
  kind: "coverage" | "report" | "claim";
  category: string | null;
  protocol: string;
  email: string | null;
  company: string | null;
  notebookSlug: string | null;
  role: string | null;
  source: Record<string, string> | null;
  createdAt: string;
};

export type StudioOverview = {
  officialWorkspaceIds: string[];
  notebooks: StudioNotebook[];
  leads: StudioLead[];
};

// =====================================
// ⬢  Storage
// =====================================
// The password lasts as long as the tab does. Storage can be blocked, and the
// studio then asks again each visit.
function readPassword(): string | null {
  try {
    return window.sessionStorage.getItem(PASSWORD_KEY);
  } catch {
    return null;
  }
}

function writePassword(password: string | null) {
  try {
    if (password) window.sessionStorage.setItem(PASSWORD_KEY, password);
    else window.sessionStorage.removeItem(PASSWORD_KEY);
  } catch {
    // Nothing to do: the studio asks again next time.
  }
}

// =====================================
// ⬢  useShowcaseStudio
// =====================================
// Everything the studio reads and writes. It asks with the studio password,
// or with no password for someone signed in as staff; when neither is let in,
// `locked` is true and the studio shows its gate.
export function useShowcaseStudio() {
  // State
  const [password, setPassword] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setPassword(readPassword());
    setReady(true);
  }, []);

  const variables = { password: password ?? undefined };
  const { data, loading, error, refetch } = useQuery(OVERVIEW, {
    variables,
    skip: !ready,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const [saveNotebookMutation] = useMutation(SAVE_NOTEBOOK);
  const [saveCategoryMutation] = useMutation(SAVE_CATEGORY);
  const [deleteCategoryMutation] = useMutation(DELETE_CATEGORY);
  const [saveChainMutation] = useMutation(SAVE_CHAIN);
  const [approveClaimMutation] = useMutation(APPROVE_CLAIM);

  // Handlers
  const unlock = useCallback((next: string) => {
    writePassword(next);
    setTried(true);
    setPassword(next);
  }, []);

  const lock = useCallback(() => {
    writePassword(null);
    setTried(false);
    setPassword(null);
  }, []);

  // Each write then asks again, so what is on screen is what is stored.
  const write = useCallback(
    async (run: () => Promise<unknown>) => {
      await run();
      await refetch(variables);
    },
    [refetch, password]
  );

  const saveNotebook = (
    documentId: string,
    showcase: Record<string, unknown> | null
  ) =>
    write(() =>
      saveNotebookMutation({
        variables: { documentId, showcase, ...variables },
      })
    );

  const saveCategory = (input: Record<string, unknown>) =>
    write(() => saveCategoryMutation({ variables: { input, ...variables } }));

  const deleteCategory = (slug: string) =>
    write(() => deleteCategoryMutation({ variables: { slug, ...variables } }));

  const saveChain = (input: Record<string, unknown>) =>
    write(() => saveChainMutation({ variables: { input, ...variables } }));

  const approveClaim = (leadId: string) =>
    write(() => approveClaimMutation({ variables: { leadId, ...variables } }));

  return {
    overview: (data?.getShowcaseAdmin ?? null) as StudioOverview | null,
    config: (data?.getShowcaseConfig ?? null) as ShowcaseConfig | null,
    loading: !ready || loading,
    locked: ready && !loading && !data?.getShowcaseAdmin && !!error,
    // The gate says why it is closed only after a password was tried.
    gateError: tried && error ? "That is not the password" : null,
    unlock,
    lock,
    saveNotebook,
    saveCategory,
    deleteCategory,
    saveChain,
    approveClaim,
  };
}
