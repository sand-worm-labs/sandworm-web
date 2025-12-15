"use client";

import { UserPlusIcon } from "@heroicons/react/20/solid";
import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { ScrollBar } from "@sandworm/ui/components/scroll-area";

import type { UserWorkspaceRole } from "@/types";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { useSession } from "@/components/Visualization/hooks/useAuth";
import { Tooltip } from "@/components/Visualization/blocks/ToolTips";
import UsersList from "@/components/Visualization/blocks/UsersList";
import { useUsers } from "@/components/Visualization/hooks/useUsers";

export default function UsersPage() {
  const workspaceId = useStringQuery("workspaceId");
  const session = useSession({ redirectToLogin: true });
  const router = useRouter();

  const isAdmin = session.data?.roles[workspaceId] === "admin";

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

  return (
    <ScrollBar className="w-full bg-white h-full overflow-auto">
      <div className="px-4 sm:p-6 lg:p-8">
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
                  ? "bg-primary-200 hover:bg-primary-300"
                  : "bg-gray-300 cursor-not-allowed",
                "flex items-center gap-x-2 rounded-sm shadow-sm px-3.5 py-2.5 text-sm font-semibold border-stone-950"
              )}
            >
              <UserPlusIcon className="h-4 w-4" /> Add user
            </button>
          </Tooltip>
        </div>

        <UsersList
          currentUserEmail={session.data?.email ?? ""}
          users={users}
          workspaceId={workspaceId}
          onRemoveUser={removeUser}
          onChangeRole={onChangeRole}
          onResetPassword={onResetPassword}
          role={session.data?.roles[workspaceId] ?? "viewer"}
        />
      </div>
    </ScrollBar>
  );
}
