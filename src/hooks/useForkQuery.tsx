import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { forkQuery } from "@/services/axios/queryService";

export const useForkQuery = (queryId: string) => {
  const { data: session } = useSession();
  const uid = session?.user?.id;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFork = useCallback(async () => {
    if (!uid || !queryId || loading) return;

    setLoading(true);
    setSuccess(false);

    try {
      await forkQuery(queryId, uid);
      toast.success("Query forked successfully");
      setSuccess(true);
    } catch (err) {
      console.error("Fork failed:", err);
      toast.error("Failed to fork query");
    } finally {
      setLoading(false);
    }
  }, [uid, queryId, loading]);

  return { handleFork, loading, success };
};
