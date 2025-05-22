import { useCallback, useState } from "react";
import { toast } from "sonner";

import { deleteUserQuery } from "@/services/axios/queryService";
import { useQueryStore } from "@/store/queries";
import { useSession } from "next-auth/react";

export const useDeleteQuery = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { loadQueries } = useQueryStore();
  const { data: session } = useSession();

  const handleDelete = useCallback(
    async (id: string) => {
      if (!id || loading) return;

      setLoading(true);
      setSuccess(false);

      try {
        if (!session?.user?.id) {
          toast.error("You need to login first to save this query 🤨");
          return;
        }

        await deleteUserQuery(id);
        await loadQueries(session.user.id); // hmm
        toast.success("Query deleted successfully");
        setSuccess(true);
      } catch (err) {
        console.error("Delete failed:", err);
        toast.error("Failed to delete query");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  return { handleDelete, loading, success };
};
