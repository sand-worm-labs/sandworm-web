"use client";

import { UserPlusIcon } from "@heroicons/react/20/solid";
import React, { useCallback, useState, useMemo } from "react";
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
import {
  UserControl,
  type RoleFilter,
} from "@/components/Visualization/UserControl";
import InviteUserModal from "@/components/InviteUser";
import { useInviteUserToWorkspace } from "@/components/Visualization/hooks/useWorkspaces";
import toast from "react-hot-toast";

export default function UsersPage() {
  const workspaceId = useStringQuery("workspace");
  const session = useSession({ redirectToLogin: true });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { inviteUser, loading, error } = useInviteUserToWorkspace(workspaceId);

  const { data: workspaceData, loading: workspaceLoading } =
    useGetWorkspaceQuery({
      variables: { workspaceId },
      skip: !workspaceId,
    });

  function getWorkspaceRole(
    roles: Array<Record<string, UserWorkspaceRole>> | undefined,
    workspaceId?: string
  ) {
    if (!roles || !workspaceId) return null;
    return roles.find(r => r[workspaceId])?.[workspaceId] ?? null;
  }

  const role = getWorkspaceRole(session.user?.role, workspaceId);

  const isAdmin = role === "admin";

  const [users, { removeUser, updateUser, resetPassword }] =
    useUsers(workspaceId);

  // Search and filter state
  const [searchValue, setSearchValue] = useState("");
  const [roleFilters, setRoleFilters] = useState<RoleFilter[]>([
    { role: "admin", label: "Admin", count: 0, enabled: false },
    { role: "manager", label: "Manager", count: 0, enabled: false },
    { role: "editor", label: "Editor", count: 0, enabled: false },
    { role: "viewer", label: "Viewer", count: 0, enabled: false },
    { role: "guest", label: "Guest", count: 0, enabled: false },
  ]);

  // Calculate role counts and update filters
  useMemo(() => {
    const roleCounts: Record<string, number> = {
      admin: 0,
      manager: 0,
      editor: 0,
      viewer: 0,
      guest: 0,
    };

    users.forEach(user => {
      if (user.role && roleCounts[user.role] !== undefined) {
        roleCounts[user.role]++;
      }
    });

    setRoleFilters(prev =>
      prev.map(filter => ({
        ...filter,
        count: roleCounts[filter.role] || 0,
      }))
    );
  }, [users]);

  // Filter users based on search and role filters
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(user => {
        const fullName = user.fullName?.toLowerCase() || "";
        const firstName = user.firstName?.toLowerCase() || "";
        const lastName = user.lastName?.toLowerCase() || "";
        const username = user.username?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";

        return (
          fullName.includes(searchLower) ||
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          username.includes(searchLower) ||
          email.includes(searchLower)
        );
      });
    }

    // Apply role filters (if any are enabled)
    const enabledRoles = roleFilters.filter(f => f.enabled).map(f => f.role);

    if (enabledRoles.length > 0) {
      filtered = filtered.filter(
        user => user.role && enabledRoles.includes(user.role as any)
      );
    }

    return filtered;
  }, [users, searchValue, roleFilters]);

  const handleRoleFilterChange = useCallback(
    (role: string, enabled: boolean) => {
      setRoleFilters(prev =>
        prev.map(filter =>
          filter.role === role ? { ...filter, enabled } : filter
        )
      );
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setRoleFilters(prev => prev.map(filter => ({ ...filter, enabled: false })));
  }, []);

  const onChangeRole = useCallback(
    (id: string, role: UserWorkspaceRole) => {
      updateUser(id, { role });
    },
    [updateUser]
  );

  const [, setNewPassword] = useState<{
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
      setNewPassword({
        name: user.fullName || user.username || "User",
        password: newPassword,
      });
    },
    [resetPassword, users]
  );

  const handleInviteUser = async (email: string, role?: string) => {
    try {
      const success = await inviteUser(email, workspaceId, role);

      if (success) {
        toast.success(`Invitation sent to ${email}`);
      } else {
        toast.error("Failed to send invitation");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitation";
      toast.error(errorMessage);
      throw err;
    }
  };

  const isAddEnabled = isAdmin;

  const workspace = workspaceData?.getWorkspace;

  if (workspaceLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Loading workspace...</div>
      </div>
    );
  }

  return (
    <>
      <ScrollBar className="w-full  h-full overflow-auto  ">
        <div className="px-4 sm:p-6 lg:p-8 min-h-[100vh]">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-1">
                Users
              </h2>
              <p className="mb-6 text-[#6C757D] dark:text-gray-400">
                List of users in {workspace?.name} team
              </p>
            </div>

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
                onClick={() => setIsInviteModalOpen(true)}
                disabled={!isAddEnabled}
                className={clsx(
                  isAddEnabled
                    ? "bg-[#A308F0] hover:bg-primary-300"
                    : "bg-[#A308F0DD] cursor-not-allowed",
                  "px-6 py-2 bg-[#A308F0] text-white rounded-xl hover:bg-[#B55A50] text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                )}
              >
                <UserPlusIcon className="h-4 w-4" /> Invite user
              </button>
            </Tooltip>
          </div>

          <div className="mb-6">
            <UserControl
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              roleFilters={roleFilters}
              onRoleFilterChange={handleRoleFilterChange}
              onResetFilters={handleResetFilters}
              totalUsers={filteredUsers.length}
            />
          </div>

          <UsersList
            currentUserEmail={session.user?.email ?? ""}
            users={filteredUsers}
            onRemoveUser={removeUser}
            onChangeRole={onChangeRole}
            onResetPassword={onResetPassword}
            role={role ?? "viewer"}
          />
        </div>
      </ScrollBar>
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceName={workspace?.name || "workspace"}
        onInvite={handleInviteUser}
      />
    </>
  );
}
