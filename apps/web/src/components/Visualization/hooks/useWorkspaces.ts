import { useCallback, useMemo } from "react";
import type { WorkspaceEditFormValues } from "@sandworm/types";

import type { ApiWorkspace } from "@/types";
import {
  useGetUserWorkspacesQuery,
  useGetWorkspaceQuery,
  useGetUserWorkspaceInfoQuery,
  useUpdateWorkspaceMutation,
  useSwitchWorkspaceMutation,
} from "@/generated/graphql";

import { NEXT_PUBLIC_API_URL } from "../utils/env";

import { useSession } from "./useAuth";

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

// 3. Update workspace wrapper with admin check
type UseUpdateWorkspaceReturn = {
  updateWorkspace: (workspaceId: string, name: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
};

export const useUpdateWorkspace = (
  workspaceId?: string
): UseUpdateWorkspaceReturn => {
  const session = useSession({ redirectToLogin: false });
  const { workspaceInfo, refetch: refetchWorkspaceInfo } =
    useCurrentWorkspaceInfo();

  const {
    data: workspacesData,
    loading: workspacesLoading,
    refetch: refetchWorkspaces,
  } = useGetUserWorkspacesQuery({
    fetchPolicy: "cache-and-network",
  });

  const [updateWorkspaceMutation, { loading, error }] =
    useUpdateWorkspaceMutation();

  // Check if current user is admin
  const isAdmin = useMemo(() => {
    if (!workspaceInfo || !session?.user?.id) return false;

    const targetWorkspaceId = workspaceId || workspaceInfo.id;
    if (workspaceInfo.id !== targetWorkspaceId) return false;

    return workspaceInfo.role === "admin";
  }, [workspaceInfo, session?.user?.id, workspaceId]);

  const updateWorkspace = useCallback(
    async (targetWorkspaceId: string, name: string) => {
      if (!isAdmin) {
        throw new Error("You must be an admin to update workspace settings");
      }

      try {
        const result = await updateWorkspaceMutation({
          variables: {
            workspaceId: targetWorkspaceId,
            name,
          },
        });

        if (result.data?.updateWorkspace) {
          // Refetch workspace info to get updated data
          await refetchWorkspaceInfo();
          await refetchWorkspaces();
        }

        return result.data?.updateWorkspace;
      } catch (err) {
        console.error("Failed to update workspace:", err);
        throw err;
      }
    },
    [isAdmin, updateWorkspaceMutation, refetchWorkspaceInfo, refetchWorkspaces]
  );

  return {
    updateWorkspace,
    loading,
    error: error as Error | null,
    isAdmin,
  };
};

// 4. Switch workspace hook
type UseSwitchWorkspaceReturn = {
  switchWorkspace: (workspaceId: string) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
};

export const useSwitchWorkspace = (): UseSwitchWorkspaceReturn => {
  const { refetch: refetchWorkspaceInfo } = useCurrentWorkspaceInfo();
  const { refetch: refetchWorkspaces } = useGetUserWorkspacesQuery({
    fetchPolicy: "cache-and-network",
  });

  const [switchWorkspaceMutation, { loading, error }] =
    useSwitchWorkspaceMutation();

  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      try {
        const result = await switchWorkspaceMutation({
          variables: { workspaceId },
        });

        if (result.data?.switchWorkspace) {
          // Refetch workspace info to get the new current workspace
          await refetchWorkspaceInfo();
          await refetchWorkspaces();
          return true;
        }

        return false;
      } catch (err) {
        console.error("Failed to switch workspace:", err);
        throw err;
      }
    },
    [switchWorkspaceMutation, refetchWorkspaceInfo, refetchWorkspaces]
  );

  return {
    switchWorkspace,
    loading,
    error: error as Error | null,
  };
};
