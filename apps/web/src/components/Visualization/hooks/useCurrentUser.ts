import { useCallback, useMemo } from "react";

import {
  useUpdateUserMutation,
  useUpdateSocialLinksMutation,
  useUpdateStatusTextMutation,
  useCurrentUserQuery as useGetCurrentUserQuery,
  type UpdateUserInput,
  type SocialLinksInput,
} from "@/generated/graphql";

type UseCurrentUserReturn = {
  updateUser: (input: UpdateUserInput) => Promise<void>;
  updateSocialLinks: (input: SocialLinksInput) => Promise<void>;
  updateStatusText: (statusText: string) => Promise<void>;
  updateProfile: (params: {
    user?: UpdateUserInput;
    socialLinks?: SocialLinksInput;
    statusText?: string;
  }) => Promise<void>;
  loading: boolean;
  error: Error | null;
  currentUser: any;
  refetch: () => void;
};

export const useCurrentUser = (): UseCurrentUserReturn => {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useGetCurrentUserQuery({ fetchPolicy: "cache-and-network" });

  const [updateUserMutation, { loading: userLoading, error: userError }] =
    useUpdateUserMutation();

  const [
    updateSocialLinksMutation,
    { loading: socialLoading, error: socialError },
  ] = useUpdateSocialLinksMutation();

  const [
    updateStatusTextMutation,
    { loading: statusLoading, error: statusError },
  ] = useUpdateStatusTextMutation();

  const updateUser = useCallback(
    async (input: UpdateUserInput) => {
      await updateUserMutation({ variables: { input } });
      await refetch();
    },
    [updateUserMutation, refetch]
  );

  const updateSocialLinks = useCallback(
    async (input: SocialLinksInput) => {
      await updateSocialLinksMutation({ variables: { input } });
      await refetch();
    },
    [updateSocialLinksMutation, refetch]
  );

  const updateStatusText = useCallback(
    async (statusText: string) => {
      await updateStatusTextMutation({ variables: { statusText } });
      await refetch();
    },
    [updateStatusTextMutation, refetch]
  );

  const updateProfile = useCallback(
    async ({
      user,
      socialLinks,
      statusText,
    }: {
      user?: UpdateUserInput;
      socialLinks?: SocialLinksInput;
      statusText?: string;
    }) => {
      await Promise.all([
        user && updateUserMutation({ variables: { input: user } }),
        socialLinks &&
          updateSocialLinksMutation({ variables: { input: socialLinks } }),
        statusText !== undefined &&
          updateStatusTextMutation({ variables: { statusText } }),
      ]);
      await refetch();
    },
    [
      updateUserMutation,
      updateSocialLinksMutation,
      updateStatusTextMutation,
      refetch,
    ]
  );

  return useMemo(
    () => ({
      updateUser,
      updateSocialLinks,
      updateStatusText,
      updateProfile,
      loading: queryLoading || userLoading || socialLoading || statusLoading,
      error: (queryError ||
        userError ||
        socialError ||
        statusError) as Error | null,
      currentUser: data?.currentUser.user,
      refetch,
    }),
    [
      updateUser,
      updateSocialLinks,
      updateStatusText,
      updateProfile,
      queryLoading,
      userLoading,
      socialLoading,
      statusLoading,
      queryError,
      userError,
      socialError,
      statusError,
      data,
      refetch,
    ]
  );
};
