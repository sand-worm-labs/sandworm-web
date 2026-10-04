"use client";

import { useCallback, useEffect, useState } from "react";

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

export function useBountyEntries(workspaceId: string) {
  const [entries, setEntries] = useState<Entries>({});

  useEffect(() => {
    if (workspaceId) setEntries(read(workspaceId));
  }, [workspaceId]);

  const saveEntry = useCallback(
    (slug: string, documentId: string) => {
      setEntries(prev => {
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
    },
    [workspaceId]
  );

  return { entries, saveEntry };
}
