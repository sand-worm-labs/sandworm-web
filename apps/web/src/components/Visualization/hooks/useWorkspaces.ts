import { useCallback, useMemo, useState } from "react";
import type { WorkspaceEditFormValues } from "@sandworm/types";

import type { ApiWorkspace } from "@/types";
import {
  useGetUserWorkspacesQuery,
  useGetWorkspaceQuery,
  useGetUserWorkspaceInfoQuery,
  useUpdateWorkspaceMutation,
  useSwitchWorkspaceMutation,
  useInviteUserToWorkspaceMutation,
  useAcceptWorkspaceInvitationMutation,
  useGetWorkspaceWithMembersQuery,
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

// 4. Invite user to workspace
type UseInviteUserToWorkspaceReturn = {
  inviteUser: (
    email: string,
    workspaceId: string,
    role?: string
  ) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
};

export const useInviteUserToWorkspace = (
  workspaceId?: string
): UseInviteUserToWorkspaceReturn => {
  const session = useSession({ redirectToLogin: false });
  const { workspaceInfo, refetch: refetchWorkspaceInfo } =
    useCurrentWorkspaceInfo();

  const [inviteUserMutation, { loading, error }] =
    useInviteUserToWorkspaceMutation();

  // Check if current user is admin
  const isAdmin = useMemo(() => {
    if (!workspaceInfo || !session?.user?.id) return false;

    const targetWorkspaceId = workspaceId || workspaceInfo.id;
    if (workspaceInfo.id !== targetWorkspaceId) return false;

    return workspaceInfo.role === "admin";
  }, [workspaceInfo, session?.user?.id, workspaceId]);

  const inviteUser = useCallback(
    async (email: string, targetWorkspaceId: string, role?: string) => {
      if (!isAdmin) {
        throw new Error(
          "You must be an admin to invite users to the workspace"
        );
      }

      try {
        const result = await inviteUserMutation({
          variables: {
            email,
            workspaceId: targetWorkspaceId,
            role,
          },
        });

        if (result.data?.inviteUserToWorkspace) {
          // Optionally refetch workspace info to get updated members list
          await refetchWorkspaceInfo();
          return true;
        }

        return false;
      } catch (err) {
        console.error("Failed to invite user:", err);
        throw err;
      }
    },
    [isAdmin, inviteUserMutation, refetchWorkspaceInfo]
  );

  return {
    inviteUser,
    loading,
    error: error as Error | null,
    isAdmin,
  };
};

type AcceptInvitationState = {
  loading: boolean;
  success: boolean;
  error?: "expired" | "invalid" | "unauthorized" | "unexpected";
};

type AcceptInvitationAPI = {
  acceptInvitation: (hash: string) => Promise<void>;
};

type UseAcceptInvitation = [AcceptInvitationState, AcceptInvitationAPI];

export const useAcceptInvitation = (): UseAcceptInvitation => {
  const [state, setState] = useState<AcceptInvitationState>({
    loading: false,
    success: false,
    error: undefined,
  });

  const { refetch: refetchWorkspaces } = useGetUserWorkspacesQuery({
    fetchPolicy: "cache-and-network",
  });

  const { refetch: refetchWorkspaceInfo } = useCurrentWorkspaceInfo();

  const [acceptMutation] = useAcceptWorkspaceInvitationMutation();

  const acceptInvitation = useCallback(
    async (hash: string) => {
      setState({ loading: true, success: false, error: undefined });

      try {
        const result = await acceptMutation({
          variables: { hash },
        });

        if (result.data?.acceptWorkspaceInvitation) {
          await refetchWorkspaces();
          await refetchWorkspaceInfo();
          setState({ loading: false, success: true, error: undefined });
        } else {
          setState({ loading: false, success: false, error: "invalid" });
        }
      } catch (err: any) {
        const message = err?.message?.toLowerCase() || "";

        if (message.includes("expired")) {
          setState({ loading: false, success: false, error: "expired" });
        } else if (
          message.includes("invalid") ||
          message.includes("not found")
        ) {
          setState({ loading: false, success: false, error: "invalid" });
        } else if (
          message.includes("unauthorized") ||
          message.includes("unauthenticated")
        ) {
          setState({ loading: false, success: false, error: "unauthorized" });
        } else {
          setState({ loading: false, success: false, error: "unexpected" });
        }
      }
    },
    [acceptMutation, refetchWorkspaces, refetchWorkspaceInfo]
  );

  return useMemo(
    () => [state, { acceptInvitation }],
    [state, acceptInvitation]
  );
};

export type WorkspaceMember = {
  id: string;
  userId: string;
  role: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  name: string;
};

export const useWorkspaceWithMembers = (workspaceId: string | undefined) => {
  const session = useSession({ redirectToLogin: false });

  const { data, loading, error, refetch } = useGetWorkspaceWithMembersQuery({
    variables: { workspaceId: workspaceId! },
    skip: !workspaceId,
    fetchPolicy: "cache-and-network",
  });

  const members: WorkspaceMember[] = useMemo(() => {
    if (!data?.getWorkspaceMembers) return [];

    return data.getWorkspaceMembers.map(member => {
      const fullName =
        [member.user?.firstName, member.user?.lastName]
          .filter(Boolean)
          .join(" ") ||
        member.user?.username ||
        member.user?.email ||
        "";

      return {
        id: member.userId,
        userId: member.userId,
        role: member.role,
        email: member.user?.email ?? "",
        username: member.user?.username ?? null,
        firstName: member.user?.firstName ?? null,
        lastName: member.user?.lastName ?? null,
        fullName,
        name: fullName,
      };
    });
  }, [data?.getWorkspaceMembers]);

  const currentUserRole = useMemo(() => {
    if (!session?.user?.id || !members.length) return null;
    const currentMember = members.find(m => m.userId === session.user?.id);
    return currentMember?.role ?? null;
  }, [members, session?.user?.id]);

  return {
    workspace: data?.getWorkspace,
    members,
    currentUserRole,
    isLoading: loading,
    error,
    refetch,
  };
};
