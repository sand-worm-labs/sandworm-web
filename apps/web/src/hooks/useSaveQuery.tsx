import { useState, useCallback } from "react";
import toast from "react-hot-toast";

import {
  patchUserQuery,
  type CreateQueryPayload,
} from "@/services/axios/queryService";
import { useQueryStore } from "@/store/queries";
import { useSession } from "@/components/Editor/hooks/useAuth";

export const useSaveQuery = () => {
  const session = useSession({ redirectToLogin: true });
  const { loadQueries } = useQueryStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (payload: Omit<CreateQueryPayload, "creator"> & { id: string }) => {
      if (!session?.user?.id) {
        toast.error("You need to login first to save this query 🤨");
        return null;
      }

      const data: CreateQueryPayload = {
        ...payload,
        creator: session.user.id,
      };

      setLoading(true);
      setError(null);

      try {
        const response = await patchUserQuery(data);
        await loadQueries(session.user.id); // sneaky ik
        toast.success("Query saved! 💾");
        return response;
      } catch (err: any) {
        console.error("Save query error:", err);
        toast.error("Failed to save query 💀");
        setError("Save failed.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id]
  );

  return { save, loading, error };
};
