"use client";

import React, { useState, useMemo, useCallback } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircleIcon,
  UsersIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

import type { ApiWorkspace } from "@/types";

import {
  useCurrentWorkspaceInfo,
  useSwitchWorkspace,
  useUpdateWorkspace,
  useWorkspaces,
} from "../Editor/hooks/useWorkspaces";
import { useSession } from "../Editor/hooks/useAuth";
import { WorkspaceIcon } from "../Assets/WorkspaceIcon";

import { WorkspaceIcon as WorkspaceIconAvatar } from "./WorkspaceIcon";
import CreateTeamModal from "./CreateTeam";
import WorkspaceSettingsModal from "./WorkspaceSettings";

// =====================================
// ⬢ Utils
// =====================================
function memberLabel(count: number): string {
  return `${count} ${count === 1 ? "member" : "members"}`;
}

// =====================================
// ⬢ Types
// =====================================
type WorkspaceRowProps = {
  workspace: ApiWorkspace;
  isCurrentWorkspace: boolean;
  isAdmin: boolean;
  allowSettings: boolean;
  isSwitching: boolean;
  onSwitch: (id: string) => void;
  onOpenSettings: (id: string) => void;
};

// =====================================
// ⬢ WorkspaceTableHeader
// =====================================
function WorkspaceTableHeader() {
  return (
    <div className="flex items-center px-5 py-3 text-xs font-medium text-[#6C757D] dark:text-ink-400 uppercase tracking-wider border-border-secondary  dark:border-border-tertiary border-b">
      <div className="flex-1">Workspace</div>
      <div className="hidden sm:block w-32 text-center">Members</div>
      <div className="hidden sm:block w-24 text-center">Plan</div>
      <div className="w-10" />
    </div>
  );
}

// =====================================
// ⬢ Workspace Row
// =====================================
function WorkspaceRow({
  workspace,
  isCurrentWorkspace,
  isAdmin,
  allowSettings,
  isSwitching,
  onSwitch,
  onOpenSettings,
}: WorkspaceRowProps) {
  const memberCount = workspace.users?.length || 1;
  const canManage = allowSettings && isAdmin;

  return (
    <div
      className={clsx(
        "flex items-center px-5 py-4 border-b border-border-secondary  dark:border-border-tertiary transition-colors",
        !isCurrentWorkspace && "hover:bg-gray-50 dark:hover:bg-[#181C21]"
      )}
    >
      {/* ✦ Workspace name + switch  ✦ */}
      <button
        type="button"
        onClick={() => onSwitch(workspace.id)}
        disabled={isSwitching || isCurrentWorkspace}
        className="flex-1 flex items-center gap-4 text-left cursor-pointer min-w-0"
      >
        <WorkspaceIconAvatar icon={workspace?.icon} />

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className=" capitalize text-sm font-medium  text-ink-100 dark:text-white truncate">
              {workspace.name}
            </span>
            {isCurrentWorkspace && (
              <CheckCircleIcon className="w-5 h-5 text-[#7F56D9]" />
            )}
          </div>

          {/* ✦  Mobile-only member + plan info  ✦ */}
          <div className="flex items-center gap-2 mt-0.5 sm:hidden">
            <span className="text-xs text-[#6C757D] dark:text-ink-400">
              {memberLabel(memberCount)}
            </span>
            <span className="text-xs text-[#6C757D] dark:text-ink-400">·</span>
            <span className="text-xs text-[#6C757D] dark:text-ink-400 capitalize">
              {workspace.plan || "Free"}
            </span>
          </div>
        </div>
      </button>

      {/* ✦ Member Count ✦ */}
      <div className="hidden sm:flex w-32 items-center justify-center gap-2 text-sm text-[#6C757D] font-medium dark:text-ink-400">
        <UsersIcon className="w-5 h-5" />
        <span>{memberLabel(memberCount)}</span>
      </div>

      {/* ✦ Plan ✦ */}
      <div className="hidden sm:block w-24 text-center text-sm text-ink-400 dark:text-ink-400 capitalize">
        {workspace.plan || "Free"}
      </div>

      {/* ✦ Settings Action Button ✦ */}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          if (canManage) onOpenSettings(workspace.id);
        }}
        disabled={!canManage}
        title={
          !isAdmin
            ? "Only the workspace owner can manage settings"
            : "Workspace settings"
        }
        className={clsx(
          "w-10 flex justify-center transition-colors",
          canManage
            ? "text-ink-400 hover:text-gray-600 dark:hover:text-ink-300 cursor-pointer"
            : "text-ink-300 dark:text-ink-400 cursor-not-allowed opacity-40"
        )}
      >
        <Cog6ToothIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

// =====================================
// ⬢ Workspace Table
// =====================================
function WorkspaceTable({
  workspaces,
  currentWorkspaceId,
  allowSettings,
  isSwitching,
  isAdminOf,
  onSwitch,
  onOpenSettings,
}: {
  workspaces: ApiWorkspace[];
  currentWorkspaceId: string | undefined;
  allowSettings: boolean;
  isSwitching: boolean;
  isAdminOf: (id: string) => boolean;
  onSwitch: (id: string) => void;
  onOpenSettings: (id: string) => void;
}) {
  return (
    <div className="w-full">
      <WorkspaceTableHeader />
      <div className="space-y-0">
        {workspaces.map(ws => (
          <WorkspaceRow
            key={ws.id}
            workspace={ws}
            isCurrentWorkspace={ws.id === currentWorkspaceId}
            isAdmin={isAdminOf(ws.id)}
            allowSettings={allowSettings}
            isSwitching={isSwitching}
            onSwitch={onSwitch}
            onOpenSettings={onOpenSettings}
          />
        ))}
      </div>
    </div>
  );
}

// =====================================
// ⬢ Workspace Settings Main
// =====================================
export default function WorkspaceSettings() {
  const router = useRouter();

  const session = useSession({ redirectToLogin: true });
  const { workspaceInfo } = useCurrentWorkspaceInfo();
  const [{ data: allWorkspaces }] = useWorkspaces();
  const { updateWorkspace, loading: isUpdating } = useUpdateWorkspace();
  const { switchWorkspace, loading: isSwitching } = useSwitchWorkspace();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<ApiWorkspace | null>(null);

  // ⬢ Derived
  // =====================================
  const { ownedWorkspaces, invitedWorkspaces } = useMemo(() => {
    const userId = session?.user?.id;
    if (!userId || !allWorkspaces)
      return { ownedWorkspaces: [], invitedWorkspaces: [] };
    return {
      ownedWorkspaces: allWorkspaces.filter(w => w.ownerId === userId),
      invitedWorkspaces: allWorkspaces.filter(w => w.ownerId !== userId),
    };
  }, [allWorkspaces, session?.user?.id]);

  // ⬢ Handlers
  // =====================================
  const isAdminOf = useCallback(
    (targetId: string): boolean => {
      if (!session?.user?.id || !allWorkspaces) return false;
      return (
        allWorkspaces.find(w => w.id === targetId)?.ownerId === session.user.id
      );
    },
    [allWorkspaces, session?.user?.id]
  );

  const handleSwitch = useCallback(
    async (targetId: string) => {
      try {
        const success = await switchWorkspace(targetId);
        if (success)
          router.push(`/workspace/${targetId}/settings/account?switched=1`);
      } catch {
        toast.error("Failed to switch team. Please try again.");
      }
    },
    [switchWorkspace, router]
  );

  const handleOpenSettings = useCallback(
    (targetId: string) => {
      const target = allWorkspaces.find(w => w.id === targetId) ?? null;
      setSelectedWorkspace(target);
    },
    [allWorkspaces]
  );

  const sharedTableProps = {
    currentWorkspaceId: workspaceInfo?.id,
    isSwitching,
    isAdminOf,
    onSwitch: handleSwitch,
    onOpenSettings: handleOpenSettings,
  };

  return (
    <div className="w-full h-full font-body">
      <div className="px-4 sm:p-6 lg:p-8">
        {/* ✦ Page Header✦ */}
        <div className="flex md:flex-row flex-col md:items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-ink-100 mb-2">
              Account Settings
            </h3>
            <p className="text-[#6C757D] dark:text-ink-400 text-sm xl:text-base">
              Manage your workspaces, settings, permissions and billings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-4 md:mt-0 text-white px-5 py-1.5 rounded-xl text-sm bg-[#A308F0] transition-colors"
          >
            Create New Team
          </button>
        </div>

        {/* ✦ Your team ✦ */}
        <div className="grid md:grid-cols-2 gap-x-5 mb-28">
          <div>
            <h4 className="text-lg font-bold mb-3 dark:text-white">
              Your Teams
            </h4>
            <p className="text-[#6C757D] dark:text-ink-400 mb-5 max-w-[32rem] pr-6 text-sm xl:text-base">
              Your workspaces can be deleted, renamed, team members added etc
              depending on your permission level within the organization.
            </p>
          </div>
          {ownedWorkspaces.length > 0 ? (
            <WorkspaceTable
              workspaces={ownedWorkspaces}
              allowSettings
              {...sharedTableProps}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[8rem] text-center">
              <WorkspaceIcon />
              <p className="text-sm font-medium text-[#868E96] mt-3">
                No workspace Found
              </p>
            </div>
          )}
        </div>

        {/* ✦ Invited team ✦ */}
        <div className="grid md:grid-cols-2 gap-x-5">
          <div>
            <h4 className="text-lg font-bold mb-3 dark:text-white">
              Invited Teams
            </h4>
            <p className="text-[#6C757D] dark:text-ink-400 mb-5 max-w-[32rem] pr-6 text-sm xl:text-base">
              These are workspaces you've been invited to. Settings are managed
              by the workspace owner.
            </p>
          </div>
          {invitedWorkspaces.length > 0 ? (
            <WorkspaceTable
              workspaces={invitedWorkspaces}
              allowSettings={false}
              {...sharedTableProps}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[15rem] text-center">
              <WorkspaceIcon />
              <p className="text-sm font-medium text-[#868E96] mt-3">
                No workspace invites
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✦ Modals ✦ */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={id => router.push(`/workspace/${id}/settings`)}
      />

      <WorkspaceSettingsModal
        isOpen={!!selectedWorkspace}
        onClose={() => setSelectedWorkspace(null)}
        workspace={selectedWorkspace}
        _isAdmin={!!selectedWorkspace && isAdminOf(selectedWorkspace.id)}
        isCurrentWorkspace={selectedWorkspace?.id === workspaceInfo?.id}
        updateWorkspace={updateWorkspace}
        isUpdating={isUpdating}
        disableCustomAiModelKey={false}
      />
    </div>
  );
}
