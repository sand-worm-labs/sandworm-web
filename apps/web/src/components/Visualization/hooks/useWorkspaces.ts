import { useCallback, useMemo } from "react";
import type { WorkspaceEditFormValues } from "@sandworm/types";
import type { ApiWorkspace } from "@/types";
import {
  useGetUserWorkspacesQuery,
  useGetWorkspaceQuery,
  useGetUserWorkspaceInfoQuery,
} from "@/generated/graphql";
import { NEXT_PUBLIC_API_URL } from "../utils/env";

// 1. Get all user workspaces
type UseWorkspacesAPI = {
  updateSettings: (
    workspaceId: string,
    data: WorkspaceEditFormValues
  ) => Promise<ApiWorkspace>;
};

type UseWorkspaces = [
  { data: ApiWorkspace[]; isLoading: boolean },
  UseWorkspacesAPI,
];

export const useWorkspaces = (): UseWorkspaces => {
  const { data, loading, refetch } = useGetUserWorkspacesQuery({
    fetchPolicy: "cache-and-network",
  });

  const updateSettings = useCallback(
    async (workspaceId: string, data: WorkspaceEditFormValues) => {
      const res = await fetch(
        `${NEXT_PUBLIC_API_URL()}/v1/workspaces/${workspaceId}`,
        {
          credentials: "include",
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const workspace: ApiWorkspace = await res.json();
      refetch();
      return workspace;
    },
    [refetch]
  );

  return useMemo(
    () => [
      {
        data: (data?.getUserWorkspaces ?? []) as ApiWorkspace[],
        isLoading: loading,
      },
      { updateSettings },
    ],
    [data, loading, updateSettings]
  );
};

// 2. Get a specific workspace by ID
export const useWorkspace = (workspaceId: string) => {
  const { data, loading, error, refetch } = useGetWorkspaceQuery({
    variables: { workspaceId },
    skip: !workspaceId,
    fetchPolicy: "cache-and-network",
  });

  return {
    workspace: data?.getWorkspace as ApiWorkspace | null,
    isLoading: loading,
    error,
    refetch,
  };
};

export const useCurrentWorkspaceInfo = () => {
  const { data, loading, error, refetch } = useGetUserWorkspaceInfoQuery({
    fetchPolicy: "cache-and-network",
  });

  return {
    workspaceInfo: data?.getUserWorkspaceInfo,
    isLoading: loading,
    error,
    refetch,
  };
};
