"use client";

import { UserPlusIcon } from "@heroicons/react/20/solid";
import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

import type { UserWorkspaceRole } from "@/types";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { useSession } from "@/components/Visualization/hooks/useAuth";
import { Tooltip } from "@/components/Visualization/blocks/ToolTips";
import UsersList from "@/components/Visualization/blocks/UsersList";
import { useUsers } from "@/components/Visualization/hooks/useUsers";
import ScrollBar from "@/components/Visualization/blocks/ScrollBar";
import { useGetWorkspaceQuery } from "@/generated/graphql";

export default function UsersPage() {
  const workspaceId = useStringQuery("workspace");
  const session = useSession({ redirectToLogin: true });
  const router = useRouter();

  const { data: workspaceData, loading: workspaceLoading } =
    useGetWorkspaceQuery({
      variables: { workspaceId },
      skip: !workspaceId,
    });

  const isAdmin = session.user?.role === "admin";

  const [users, { removeUser, updateUser, resetPassword }] =
    useUsers(workspaceId);

  const onChangeRole = useCallback(
    (id: string, role: UserWorkspaceRole) => {
      updateUser(id, { role });
    },
    [updateUser]
  );

  const [newPassword, setNewPassword] = useState<{
    name: string;
    password: string;
  } | null>(null);

  const onResetPassword = useCallback(
    async (id: string) => {
      const user = users.find(u => u.id === id);
      if (!user) {
        return;
      }

      const newPassword = await resetPassword(id);
      setNewPassword({ name: user.name, password: newPassword });
    },
    [resetPassword, users]
  );

  const isAddEnabled = isAdmin;

  const onClosePasswordDialog = useCallback(() => {
    setNewPassword(null);
  }, []);

  const workspace = workspaceData?.getWorkspace;

  if (workspaceLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading workspace...</div>
      </div>
    );
  }

  return (
    <ScrollBar className="w-full bg-white h-full overflow-auto">
      <div className="px-4 sm:p-6 lg:p-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
            {workspace?.name}
          </h2>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <span className="font-medium">
              Plan: <span className="text-gray-900">{workspace?.plan}</span>
            </span>
            <span>•</span>
            <span>
              {users.length} {users.length === 1 ? "user" : "users"}
            </span>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4 sm:flex sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Users</h3>
          <Tooltip
            title="You've hit the free limit"
            message="Upgrade to the professional plan to add more users."
            className="flex"
            tooltipClassname="w-48"
            position="left"
            active={false}
          >
            <button
              type="button"
              id="add-user-button"
              onClick={() => {
                router.push(`/workspaces/${workspaceId}/users/new`);
              }}
              disabled={!isAddEnabled}
              className={clsx(
                isAddEnabled
                  ? "bg-[#C7665C] hover:bg-primary-300"
                  : "bg-[#C7665CDD] cursor-not-allowed",
                "px-6 py-2 bg-[#C7665C] text-white rounded-xl hover:bg-[#B55A50] text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              )}
            >
              <UserPlusIcon className="h-4 w-4" /> Add user
            </button>
          </Tooltip>
        </div>

        <UsersList
          currentUserEmail={session.user?.email ?? ""}
          users={users}
          workspaceId={workspaceId}
          onRemoveUser={removeUser}
          onChangeRole={onChangeRole}
          onResetPassword={onResetPassword}
          role={session.user?.role ?? "viewer"}
        />
      </div>
    </ScrollBar>
  );
}
