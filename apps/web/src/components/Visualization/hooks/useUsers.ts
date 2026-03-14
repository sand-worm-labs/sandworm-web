import { useCallback, useMemo } from "react";

import type { ApiUser, UserWorkspaceRole, WorkspaceUser } from "@/types";
import { useGetWorkspaceQuery } from "@/generated/graphql";

import { NEXT_PUBLIC_API_URL } from "../utils/env";
import type { UserFormValues } from "../blocks/forms/user";

type UpdateUserPayload = {
  name?: string;
  role?: UserWorkspaceRole;
  currentPassword?: string;
  newPassword?: string;
};

type API = {
  createUser: (
    payload: UserFormValues
  ) => Promise<ApiUser & { password?: string }>;
  updateUser: (
    id: string,
    payload: UpdateUserPayload
  ) => Promise<null | "invalid-payload" | "forbidden" | "incorrect-password">;
  removeUser: (id: string) => void;
  resetPassword: (id: string) => Promise<string>;
};

type UseUsers = [WorkspaceUser[], API];

export const useUsers = (workspaceId: string): UseUsers => {
  const { data, refetch } = useGetWorkspaceQuery({
    variables: { workspaceId },
    skip: !workspaceId,
  });

  const users = useMemo(() => {
    if (!data?.getWorkspace?.users) return [];

    return data.getWorkspace.users.map(user => ({
      id: user.id,
      email: user.email || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      avater: user.avater,
    })) as WorkspaceUser[];
  }, [data]);

  const createUser = useCallback(
    async (payload: UserFormValues) => {
      if (!workspaceId) {
        throw new Error("Missing workspaceId");
      }

      const res = await fetch(
        `${NEXT_PUBLIC_API_URL()}/v1/workspaces/${workspaceId}/users`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (res.status > 299) {
        throw new Error(`Unexpected status ${res.status}`);
      }

      const user = await res.json();
      await refetch();
      return user;
    },
    [workspaceId, refetch]
  );

  const updateUser = useCallback(
    async (id: string, payload: UpdateUserPayload) => {
      const res = await fetch(
        `${NEXT_PUBLIC_API_URL()}/v1/workspaces/${workspaceId}/users/${id}`,
        {
          credentials: "include",
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (res.status === 403) {
        return "forbidden";
      }

      if (res.status === 400) {
        const { reason } = await res.json();
        return reason;
      }

      await refetch();
      return null;
    },
    [workspaceId, refetch]
  );

  const removeUser = useCallback(
    async (id: string) => {
      const res = await fetch(
        `${NEXT_PUBLIC_API_URL()}/v1/workspaces/${workspaceId}/users/${id}`,
        {
          credentials: "include",
          method: "DELETE",
        }
      );

      if (res.ok) {
        await refetch();
      } else {
        // TODO proper error handling
        alert("Failed to remove user");
      }
    },
    [workspaceId, refetch]
  );

  const resetPassword = useCallback(
    async (id: string) => {
      const res = await fetch(
        `${NEXT_PUBLIC_API_URL()}/v1/workspaces/${workspaceId}/users/${id}/reset-password`,
        {
          credentials: "include",
          method: "POST",
        }
      );

      if (res.ok) {
        const { password } = await res.json();
        return password;
      }

      if (res.status === 403) {
        alert("You are not allowed to reset this user password");
        return "";
      }

      alert("Failed to reset password");
    },
    [workspaceId]
  );

  return useMemo(
    () => [users, { createUser, updateUser, resetPassword, removeUser }],
    [createUser, removeUser, resetPassword, updateUser, users]
  );
};
