"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useGetMyBountyEntriesQuery,
  useStartBountyEntryMutation,
} from "@/generated/graphql";

type Entries = Record<string, string>;

const storageKey = (workspaceId: string) =>
  `sandworm:bounty-entries:${workspaceId}`;

function read(workspaceId: string): Entries {
  try {
    return JSON.parse(
      window.localStorage.getItem(storageKey(workspaceId)) ?? "{}"
    ) as Entries;
  } catch {
    return {};
  }
}

// The notebook that is the user's entry for each bounty. The server holds it;
// this browser's record covers entries started before the server did.
export function useBountyEntries(workspaceId: string) {
  const [local, setLocal] = useState<Entries>({});
  const { data, refetch } = useGetMyBountyEntriesQuery();
  const [startEntry] = useStartBountyEntryMutation();

  useEffect(() => {
    if (workspaceId) setLocal(read(workspaceId));
  }, [workspaceId]);

  const mine = data?.getMyBountyEntries;
  const entries = useMemo<Entries>(
    () => ({
      ...local,
      ...Object.fromEntries(
        (mine ?? []).map(entry => [entry.bountySlug, entry.documentId])
      ),
    }),
    [local, mine]
  );
  const submitted = useMemo(
    () =>
      new Set(
        (mine ?? [])
          .filter(entry => entry.submittedAt)
          .map(entry => entry.bountySlug)
      ),
    [mine]
  );

  const saveEntry = useCallback(
    async (slug: string, documentId: string) => {
      setLocal(prev => {
        const next = { ...prev, [slug]: documentId };
        try {
          window.localStorage.setItem(
            storageKey(workspaceId),
            JSON.stringify(next)
          );
        } catch (err) {
          console.error(err);
        }
        return next;
      });
      try {
        await startEntry({ variables: { slug, documentId } });
        await refetch();
      } catch (err) {
        // The notebook exists and this browser remembers it; submitting it
        // records it on the server again.
        console.error(err);
      }
    },
    [workspaceId, startEntry, refetch]
  );

  return { entries, submitted, saveEntry, refetch };
}
