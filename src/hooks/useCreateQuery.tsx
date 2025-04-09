import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { createQuery, CreateQueryPayload } from "@/services/axios/queryService";

export const useCreateQuery = () => {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (payload: Omit<CreateQueryPayload, "creator">) => {
      if (!session?.userId) {
        setError("You must be logged in to save queries.");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(
          "Creating query with payload:",
          {
            ...payload,
          },
          session,
          session.userId
        );
        const response = await createQuery({
          ...payload,
          creator: session.userId,
        });
        console.log("Create query response:", response);
        return response;
      } catch (err: any) {
        console.error("Create query error:", err);
        setError("Failed to create query.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.userId]
  );

  return {
    create: handleCreate,
    loading,
    error,
  };
};
