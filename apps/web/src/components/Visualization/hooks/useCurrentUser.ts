import { useCallback, useMemo } from "react";

import {
  useUpdateUserMutation,
  useUpdateUserSettingsMutation,
  useCurrentUserQuery as useGetCurrentUserQuery,
  type UpdateUserInput,
  type UpdateUserSettingInput,
  type UserSetting,
} from "@/generated/graphql";

type UseCurrentUserReturn = {
  updateUser: (input: UpdateUserInput) => Promise<void>;
  updateUserSettings: (
    input: Omit<UpdateUserSettingInput, "id">
  ) => Promise<void>;
  loading: boolean;
  error: Error | null;
  currentUser: any;
  settings: UserSetting | null;
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
    updateUserSettingsMutation,
    { loading: settingsLoading, error: settingsError },
  ] = useUpdateUserSettingsMutation();

  const updateUser = useCallback(
    async (input: UpdateUserInput) => {
      try {
        await updateUserMutation({ variables: { input } });
        await refetch();
      } catch (err) {
        console.error("Failed to update user:", err);
        throw err;
      }
    },
    [updateUserMutation, refetch]
  );

  const updateUserSettings = useCallback(
    async (input: Omit<UpdateUserSettingInput, "id">) => {
      try {
        const result = await updateUserSettingsMutation({ variables: input });
        console.log("[updateUserSettings] mutation result:", result);
        await refetch();
      } catch (err) {
        console.error("[updateUserSettings] error:", err);
        throw err;
      }
    },
    [updateUserSettingsMutation, refetch]
  );

  return useMemo(
    () => ({
      updateUser,
      updateUserSettings,
      loading: queryLoading || userLoading || settingsLoading,
      error: (queryError || userError || settingsError) as Error | null,
      currentUser: data?.currentUser.user,
      settings: data?.currentUser.user.settings ?? null,
      refetch,
    }),
    [
      updateUser,
      updateUserSettings,
      queryLoading,
      userLoading,
      settingsLoading,
      queryError,
      userError,
      settingsError,
      data,
      refetch,
    ]
  );
};
