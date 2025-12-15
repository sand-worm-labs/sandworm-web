import { useCallback, useMemo } from "react";
import {
  useUpdateUserMutation,
  useCurrentUserQuery as useGetCurrentUserQuery,
  type UpdateUserInput,
} from "@/generated/graphql";

type UseUpdateUserReturn = {
  updateUser: (input: UpdateUserInput) => Promise<void>;
  loading: boolean;
  error: Error | null;
  currentUser: any;
  refetch: () => void;
};

export const useCurrentUser = (): UseUpdateUserReturn => {
  const {
    data,
    loading: queryLoading,
    error: queryError,
    refetch,
  } = useGetCurrentUserQuery({
    fetchPolicy: "cache-and-network",
  });

  const [updateUserMutation, { loading: updateLoading, error: updateError }] =
    useUpdateUserMutation();

  const updateUser = useCallback(
    async (input: UpdateUserInput) => {
      try {
        const result = await updateUserMutation({
          variables: { input },
        });

        if (result.data?.updateUser) {
          // Refetch user data to get updated info
          await refetch();
        }
      } catch (err) {
        console.error("Failed to update user:", err);
        throw err;
      }
    },
    [updateUserMutation, refetch]
  );

  return useMemo(
    () => ({
      updateUser,
      loading: queryLoading || updateLoading,
      error: (queryError || updateError) as Error | null,
      currentUser: data?.currentUser.user,
      refetch,
    }),
    [
      updateUser,
      queryLoading,
      updateLoading,
      queryError,
      updateError,
      data,
      refetch,
    ]
  );
};
