import { useCallback, useState } from "react";
import { toast } from "sonner";

import { deleteUserQuery } from "@/services/axios/queryService";

export const useDeleteQuery = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!id || loading) return;

      setLoading(true);
      setSuccess(false);

      try {
        await deleteUserQuery(id);
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
