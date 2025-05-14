import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

import type { CreateQueryPayload } from "@/services/axios/queryService";
import { createQuery } from "@/services/axios/queryService";
import { useSandwormStore } from "@/store";
import toast from "react-hot-toast";

export const useCreateQuery = () => {
  const { data: session } = useSession();
  const { replaceTabId, closeTab, createTab, setActiveTab } =
    useSandwormStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (payload: Omit<CreateQueryPayload, "creator">, tabId: string) => {
      if (!session?.user?.id) {
        setError("You must be logged in to save queries.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await createQuery({
          ...payload,
          creator: session.user?.id,
        });

        /* After saving, we replace the local tab ID with the Firebase one, close the old tab, and open a fresh one with the saved data */
        if (response?.id) {
          closeTab(tabId);
          replaceTabId(tabId, response.id);
          createTab(response.title, response.id, "sql", response.query);
          setActiveTab(response.id);
        } else {
          toast.error("Something went wrong while saving.");
        }

        return response;
      } catch (err: any) {
        console.error("Create query error:", err);
        setError("Failed to create query.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id, closeTab, replaceTabId]
  );

  return {
    create: handleCreate,
    loading,
    error,
  };
};
