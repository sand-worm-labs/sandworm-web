"use client";

import { UserPlusIcon } from "@heroicons/react/20/solid";
import React, { useCallback, useState, useMemo } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";

import type { UserWorkspaceRole } from "@/types";
import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { useSession } from "@/components/Visualization/hooks/useAuth";
import UsersList from "@/components/Visualization/blocks/UsersList";
import ScrollBar from "@/components/Visualization/blocks/ScrollBar";
import {
  UserControl,
  type RoleFilter,
} from "@/components/Visualization/UserControl";
import InviteUserModal from "@/components/InviteUser";
import {
  useWorkspaceWithMembers,
  useInviteUserToWorkspace,
} from "@/components/Visualization/hooks/useWorkspaces";
import { Loader } from "@/components/Loader";

export default function UsersPage() {
  const workspaceId = useStringQuery("workspace");
  const session = useSession({ redirectToLogin: true });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const {
    workspace,
    members,
    currentUserRole,
    isLoading: workspaceLoading,
    refetch: refetchMembers,
  } = useWorkspaceWithMembers(workspaceId);
  const { inviteUser } = useInviteUserToWorkspace(workspaceId);
  const isAdmin = currentUserRole === "admin";
  const [searchValue, setSearchValue] = useState("");
  const [roleFilters, setRoleFilters] = useState<RoleFilter[]>([
    { role: "admin", label: "Admin", count: 0, enabled: false },
    { role: "editor", label: "Editor", count: 0, enabled: false },
    { role: "viewer", label: "Viewer", count: 0, enabled: false },
  ]);

  const roleFiltersWithCounts = useMemo(() => {
    const roleCounts: Record<string, number> = {
      admin: 0,
      manager: 0,
      editor: 0,
      viewer: 0,
      guest: 0,
    };

    members.forEach(member => {
      if (member.role && roleCounts[member.role] !== undefined) {
        roleCounts[member.role]++;
      }
    });

    return roleFilters.map(filter => ({
      ...filter,
      count: roleCounts[filter.role] || 0,
    }));
  }, [members, roleFilters]);

  const filteredMembers = useMemo(() => {
    let filtered = members;

    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(member => {
        const fullName = member.fullName?.toLowerCase() || "";
        const firstName = member.firstName?.toLowerCase() || "";
        const lastName = member.lastName?.toLowerCase() || "";
        const username = member.username?.toLowerCase() || "";
        const email = member.email?.toLowerCase() || "";

        return (
          fullName.includes(searchLower) ||
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          username.includes(searchLower) ||
          email.includes(searchLower)
        );
      });
    }

    const enabledRoles = roleFilters.filter(f => f.enabled).map(f => f.role);

    if (enabledRoles.length > 0) {
      filtered = filtered.filter(
        member => member.role && enabledRoles.includes(member.role as any)
      );
    }

    return filtered;
  }, [members, searchValue, roleFilters]);

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

  // todo change role function
  const onChangeRole = useCallback(
    async (id: string, role: UserWorkspaceRole) => {
      console.log("Change role:", id, role);
    },
    [refetchMembers]
  );

  // remove user function
  const onRemoveUser = useCallback(
    async (id: string) => {
      console.log("Remove user:", id);
    },
    [refetchMembers]
  );

  const onResetPassword = useCallback(async (id: string) => {
    console.log("Reset password:", id);
  }, []);

  const handleInviteUser = async (email: string, role?: string) => {
    try {
      const success = await inviteUser(email, workspaceId, role);

      if (success) {
        toast.success(`Invitation sent to ${email}`);
        refetchMembers();
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

  if (workspaceLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <ScrollBar className="w-full h-full overflow-auto font-body">
        <div className="px-4 sm:p-6 lg:p-8 min-h-[100vh]">
          <div className=" dark:border-gray-800 pb-4 mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-medium text-ink-100 dark:text-white mb-1">
                Users
              </h2>
              <p className="mb-6 text-ink-400 ">
                View and manage everyone youve invited across all your
                workspaces.
              </p>
            </div>

            <button
              type="button"
              id="add-user-button"
              onClick={() => setIsInviteModalOpen(true)}
              disabled={!isAdmin}
              className={clsx(
                isAdmin
                  ? "bg-[#A308F0] hover:bg-primary-300"
                  : "bg-[#A308F0DD] cursor-not-allowed",
                "px-6 py-2 bg-[#A308F0] text-white rounded-xl hover:bg-[#A308F0] text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              )}
            >
              <UserPlusIcon className="h-4 w-4" /> Invite user
            </button>
          </div>

          <div className="mb-6">
            <UserControl
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              roleFilters={roleFiltersWithCounts}
              onRoleFilterChange={handleRoleFilterChange}
              onResetFilters={handleResetFilters}
              totalUsers={filteredMembers.length}
            />
          </div>

          <UsersList
            currentUserEmail={session.user?.email ?? ""}
            users={filteredMembers}
            onRemoveUser={onRemoveUser}
            onChangeRole={onChangeRole}
            onResetPassword={onResetPassword}
            role={currentUserRole ?? "viewer"}
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
