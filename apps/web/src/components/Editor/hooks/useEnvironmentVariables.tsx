import { useCallback } from "react";

import {
  useGetEnvironmentVariablesQuery,
  useSetEnvironmentVariablesMutation,
  useDeleteEnvironmentVariableMutation,
} from "@/generated/graphql";

// ─── TYPES ───
export type EnvVar = {
  id: string;
  name: string;
  value: string;
};

// ─── HOOK ───
export const useEnvironmentVariables = (workspaceId: string) => {
  const { data, loading, error, refetch } = useGetEnvironmentVariablesQuery({
    variables: { workspaceId },
    fetchPolicy: "cache-and-network",
  });

  const [setVars, { loading: saving }] = useSetEnvironmentVariablesMutation();
  const [deleteVar, { loading: deleting }] =
    useDeleteEnvironmentVariableMutation();

  const variables = (data?.environmentVariables ?? []) as EnvVar[];

  const save = useCallback(
    async (add: EnvVar[], remove: string[]) => {
      await setVars({
        variables: {
          workspaceId,
          input: {
            add: add.map(({ name, value }) => ({ name, value })),
            remove,
          },
        },
        refetchQueries: ["GetEnvironmentVariables"],
      });
    },
    [workspaceId, setVars]
  );

  const remove = useCallback(
    async (variableId: string) => {
      await deleteVar({
        variables: { workspaceId, variableId },
        refetchQueries: ["GetEnvironmentVariables"],
      });
    },
    [workspaceId, deleteVar]
  );

  return {
    variables,
    loading,
    saving,
    deleting,
    error: error ?? null,
    save,
    remove,
    refetch,
  };
};
