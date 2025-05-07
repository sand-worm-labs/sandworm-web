import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

import { likeQuery, unlikeQuery } from "@/services/axios/queryService";

export const useQueryLike = (queryId: string, initiallyLiked: boolean) => {
  const { data: session } = useSession();
  const uid = session?.user?.id;

  const [liked, setLiked] = useState(initiallyLiked);
  const [loading, setLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    if (!uid || !queryId || loading) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLoading(true);

    try {
      await (nextLiked ? likeQuery(queryId, uid) : unlikeQuery(queryId, uid));
    } catch (err) {
      console.error("Like toggle failed:", err);
      setLiked(!nextLiked);
    } finally {
      setLoading(false);
    }
  }, [uid, queryId, liked, loading]);

  return { liked, toggleLike, loading };
};
