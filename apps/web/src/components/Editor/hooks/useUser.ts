import { useCallback } from "react";

import type {
  GetUserProfileQuery,
  GetUserFavoritePublicDocumentsQuery,
  GetUserFollowersQuery,
} from "@/generated/graphql";
import {
  useGetUserProfileQuery,
  useGetUserFavoritePublicDocumentsQuery,
  useGetUserFollowersQuery,
  useGetUserFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/generated/graphql";

export type User = NonNullable<GetUserProfileQuery["getUser"]>;
export type Favorite =
  GetUserFavoritePublicDocumentsQuery["favoritePublicDocuments"][number];
export type FollowUser = GetUserFollowersQuery["getUserFollowers"][number];

export interface QueryOptions {
  userId: string;
  skip?: boolean;
}

export type ActionResult = { ok: true } | { ok: false; error: Error };

export const useUserProfile = ({ userId, skip = false }: QueryOptions) => {
  console.log("is userId passed", userId);
  const { data, loading, error, refetch } = useGetUserProfileQuery({
    variables: { userId },
    skip: !userId || skip,
    fetchPolicy: "cache-and-network",
  });

  console.log("user return", data);

  return {
    user: data?.getUser ?? null,
    isFollowing: data?.isFollowing ?? false,
    loading,
    error: (error as Error | undefined) ?? null,
    refetch,
  };
};

// ─── FAVORITES ───
export const useUserFavorites = ({ userId, skip = false }: QueryOptions) => {
  const { data, loading, error, refetch } =
    useGetUserFavoritePublicDocumentsQuery({
      variables: { userId },
      skip: !userId || skip,
      fetchPolicy: "cache-first",
    });

  return {
    favorites: data?.favoritePublicDocuments ?? [],
    loading,
    error: (error as Error | undefined) ?? null,
    refetch,
  };
};

// ─── FOLLOWERS ───
export const useUserFollowers = ({ userId, skip = false }: QueryOptions) => {
  const { data, loading, error, refetch } = useGetUserFollowersQuery({
    variables: { userId },
    skip: !userId || skip,
    fetchPolicy: "cache-and-network",
  });

  return {
    followers: data?.getUserFollowers ?? [],
    loading,
    error: (error as Error | undefined) ?? null,
    refetch,
  };
};

// ─── FOLLOWING ───
export const useUserFollowing = ({ userId, skip = false }: QueryOptions) => {
  const { data, loading, error, refetch } = useGetUserFollowingQuery({
    variables: { userId },
    skip: !userId || skip,
    fetchPolicy: "cache-and-network",
  });

  return {
    following: data?.getUserFollowing ?? [],
    loading,
    error: (error as Error | undefined) ?? null,
    refetch,
  };
};

// ─── FOLLOW ACTIONS ───
export interface UseFollowActionsOptions {
  username: string | null | undefined;
  onSuccess?: () => void | Promise<void>;
}

export const useFollowActions = ({
  username,
  onSuccess,
}: UseFollowActionsOptions) => {
  const [followMutation, { loading: followLoading }] = useFollowUserMutation();
  const [unfollowMutation, { loading: unfollowLoading }] =
    useUnfollowUserMutation();

  const follow = useCallback(async (): Promise<ActionResult> => {
    if (!username) return { ok: false, error: new Error("No username") };
    try {
      await followMutation({ variables: { username } });
      await onSuccess?.();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err as Error };
    }
  }, [username, followMutation, onSuccess]);

  const unfollow = useCallback(async (): Promise<ActionResult> => {
    if (!username) return { ok: false, error: new Error("No username") };
    try {
      await unfollowMutation({ variables: { username } });
      await onSuccess?.();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err as Error };
    }
  }, [username, unfollowMutation, onSuccess]);

  return {
    follow,
    unfollow,
    loading: followLoading || unfollowLoading,
  };
};

export interface UseUserOptions {
  userId: string;
  skip?: boolean;
  includeFollowers?: boolean;
  includeFollowing?: boolean;
}

export const useUser = ({
  userId,
  skip = false,
  includeFollowers = false,
  includeFollowing = false,
}: UseUserOptions) => {
  const profile = useUserProfile({ userId, skip });
  const favorites = useUserFavorites({ userId, skip });
  const followers = useUserFollowers({
    userId,
    skip: skip || !includeFollowers,
  });
  const following = useUserFollowing({
    userId,
    skip: skip || !includeFollowing,
  });

  const refetchAll = useCallback(async () => {
    await Promise.all([
      profile.refetch(),
      followers.refetch(),
      following.refetch(),
    ]);
  }, [profile.refetch, followers.refetch, following.refetch]);

  const actions = useFollowActions({
    username: profile.user?.username,
    onSuccess: refetchAll,
  });

  return {
    user: profile.user,
    isFollowing: profile.isFollowing,
    favorites: favorites.favorites,
    followers: followers.followers,
    following: following.following,
    loading: profile.loading || favorites.loading,
    followersLoading: followers.loading,
    followingLoading: following.loading,
    mutationLoading: actions.loading,
    error:
      profile.error ?? favorites.error ?? followers.error ?? following.error,
    follow: actions.follow,
    unfollow: actions.unfollow,
    refetch: refetchAll,
  };
};
