import { useCallback, useMemo } from "react";
import {
  useGetUserQuery,
  useGetUserFavoritePublicDocumentsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/generated/graphql";

// =====================================
// ⬢ Types
// =====================================
export interface UseUserOptions {
  userId: string;
  skip?: boolean;
}

export interface UseUserReturn {
  user: any | null;
  favorites: any[];
  loading: boolean;
  mutationLoading: boolean;
  error: Error | null;
  follow: () => Promise<void>;
  unfollow: () => Promise<void>;
  refetch: () => Promise<any>;
}

// =====================================
// ⬢ Use User Hook
// =====================================
export const useUser = ({ userId, skip = false }: UseUserOptions): UseUserReturn => {
  // ─── QUERIES ───
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserQuery({
    variables: { userId },
    skip: !userId || skip,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: favData,
    loading: favLoading,
    error: favError,
    refetch: refetchFavs,
  } = useGetUserFavoritePublicDocumentsQuery({
    variables: { userId },
    skip: !userId || skip,
    fetchPolicy: "cache-first",
  });

  // ─── MUTATIONS ───
  const [followMutation, { loading: followLoading, error: followError }] = useFollowUserMutation();
  const [unfollowMutation, { loading: unfollowLoading, error: unfollowError }] = useUnfollowUserMutation();

  const refetch = useCallback(async () => {
    return Promise.all([refetchUser(), refetchFavs()]);
  }, [refetchUser, refetchFavs]);

  // ─── ACTIONS ───
  const follow = useCallback(async () => {
    const username = userData?.getUser?.username;
    if (!username) return;

    try {
      await followMutation({ variables: { username } });
      await refetchUser(); // Refresh user data to update follower counts
    } catch (err) {
      console.error("Follow error:", err);
    }
  }, [userData, followMutation, refetchUser]);

  const unfollow = useCallback(async () => {
    const username = userData?.getUser?.username;
    if (!username) return;

    try {
      await unfollowMutation({ variables: { username } });
      await refetchUser(); // Refresh user data to update follower counts
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  }, [userData, unfollowMutation, refetchUser]);

  return useMemo(
    () => ({
      user: userData?.getUser ?? null,
      favorites: favData?.favoritePublicDocuments ?? [],
      loading: userLoading || favLoading,
      mutationLoading: followLoading || unfollowLoading,
      error: (userError || favError || followError || unfollowError) as Error | null,
      follow,
      unfollow,
      refetch,
    }),
    [
      userData,
      favData,
      userLoading,
      favLoading,
      followLoading,
      unfollowLoading,
      userError,
      favError,
      followError,
      unfollowError,
      follow,
      unfollow,
      refetch,
    ]
  );
};