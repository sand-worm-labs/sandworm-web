"use client";

import React, { useState, useMemo, useCallback } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

import type { ApiWorkspace } from "@/types";

import { User } from "../Assets/Avatar/User";
import {
  useCurrentWorkspaceInfo,
  useSwitchWorkspace,
  useUpdateWorkspace,
  useWorkspaces,
} from "../Visualization/hooks/useWorkspaces";
import useProperties from "../Visualization/hooks/useProperties";
import { useSession } from "../Visualization/hooks/useAuth";
import { WorkspaceIcon } from "../Assets/WorkspaceIcon";

import { WorkspaceIcon as WorkspaceIconAvatar } from "./WorkspaceIcon";
import CreateTeamModal from "./CreateTeam";
import WorkspaceSettingsModal from "./WorkspaceSettings";

export default function WorkspaceSettings() {
  const router = useRouter();

  const session = useSession({ redirectToLogin: true });
  const properties = useProperties();
  const { workspaceInfo } = useCurrentWorkspaceInfo();
  const [{ data: allWorkspaces }] = useWorkspaces();
  const { updateWorkspace, loading: isUpdating } = useUpdateWorkspace();
  const { switchWorkspace, loading: isSwitching } = useSwitchWorkspace();

  const [state, setState] = useState<{
    showCreateModal: boolean;
    selectedSettingsWorkspace: ApiWorkspace | null;
  }>({
    showCreateModal: false,
    selectedSettingsWorkspace: null,
  });


  /* Is Admin */
  const isAdminOfWorkspace = useCallback(
    (targetId: string): boolean => {
      if (!session?.user?.id || !allWorkspaces) return false;
      const workspace = allWorkspaces.find(w => w.id === targetId);
      return workspace?.ownerId === session.user.id;
    },
    [allWorkspaces, session?.user?.id]
  );

  const { ownedWorkspaces, invitedWorkspaces } = useMemo(() => {
    const userId = session?.user?.id;
    if (!userId || !allWorkspaces) {
      return { ownedWorkspaces: [], invitedWorkspaces: [] };
    }
    return {
      ownedWorkspaces: allWorkspaces.filter(w => w.ownerId === userId),
      invitedWorkspaces: allWorkspaces.filter(w => w.ownerId !== userId),
    };
  }, [allWorkspaces, session?.user?.id]);

  const handleSwitchWorkspace = async (targetWorkspaceId: string) => {
    try {
      const success = await switchWorkspace(targetWorkspaceId);
      if (success) {
        router.push(`/workspace/${targetWorkspaceId}/settings/account`);
      }
    } catch (err) {
      console.error("Failed to switch workspace:", err);
      alert("Failed to switch team. Please try again.");
    }
  };

  const handleOpenSettings = (targetWorkspaceId: string) => {
    const target = allWorkspaces.find(w => w.id === targetWorkspaceId) ?? null;
    setState(s => ({ ...s, selectedSettingsWorkspace: target }));
  };

  const renderWorkspaceRow = (
    workspace: ApiWorkspace,
    allowSettings: boolean
  ) => {
    const isCurrentWorkspace = workspace.id === workspaceInfo?.id;
    const isAdmin = isAdminOfWorkspace(workspace.id);

    return (
      <div
        key={workspace.id}
        className={clsx(
          "flex items-center px-5 py-4 border-b border-[#E9ECEF] dark:border-border-tertiary transition-colors",
          isCurrentWorkspace ? "" : "hover:bg-gray-50 dark:hover:bg-[#181C21]"
        )}
      >
        {/* Workspace name with avatar */}
        <button
          type="button"
          onClick={() => handleSwitchWorkspace(workspace.id)}
          disabled={isSwitching || isCurrentWorkspace}
          className="flex-1 flex items-center gap-4 text-left cursor-pointer min-w-0"
        >
          <WorkspaceIconAvatar icon={workspace?.icon} />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-ink-100 dark:text-white truncate">
                {workspace.name}
              </span>
              {isCurrentWorkspace && (
                <span className="text-xs px-2 py-0.5 bg-[#A308F0]/10 text-primary rounded-full whitespace-nowrap">
                  Current
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 sm:hidden">
              <span className="text-xs text-[#6C757D] dark:text-ink-400">
                {workspace.users?.length || 1}{" "}
                {workspace.users?.length === 1 ? "member" : "members"}
              </span>
              <span className="text-xs text-[#6C757D] dark:text-ink-400">
                ·
              </span>
              <span className="text-xs text-[#6C757D] dark:text-ink-400 capitalize">
                {workspace.plan || "Free"}
              </span>
            </div>
          </div>
        </button>

        <div className="hidden sm:flex w-32 items-center justify-center gap-2 text-sm text-[#6C757D] font-medium dark:text-ink-400">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>
            {workspace.users?.length || 1}{" "}
            {workspace.users?.length === 1 ? "member" : "members"}
          </span>
        </div>

        <div className="hidden sm:block w-24 text-center text-sm text-ink-400 dark:text-ink-400 capitalize">
          {workspace.plan || "Free"}
        </div>

        {/* Settings icon */}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            if (allowSettings && isAdmin) {
              handleOpenSettings(workspace.id);
            }
          }}
          disabled={!allowSettings || !isAdmin}
          className={clsx(
            "w-10 flex justify-center transition-colors",
            allowSettings && isAdmin
              ? "text-ink-400 hover:text-gray-600 dark:hover:text-ink-300 cursor-pointer"
              : "text-ink-300 dark:text-ink-400 cursor-not-allowed opacity-40"
          )}
          title={
            !isAdmin
              ? "Only the workspace owner can manage settings"
              : "Workspace settings"
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="w-full  h-full font-body">
      <div className="px-4 sm:p-6 lg:p-8">
        <div className="">
          <div className="pb-4 sm:flex flex-col mb-6">
            <div className="flex md:flex-row flex-col md:items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-ink-100  mb-2">
                  Account Settings
                </h3>
                <p className="text-[#6C757D] dark:text-ink-400 md:text-base text-sm">
                  Manage your workspaces, settings, permissions and billings.
                </p>
              </div>

              <div className="flex gap-x-2 mt-4 md:mt-0 ">
                <button
                  type="button"
                  onClick={() =>
                    setState(s => ({ ...s, showCreateModal: true }))
                  }
                  className="text-primary text-left px-5 py-1.5 rounded-xl text-sm bg-[#A308F0] text-white transition-colors"
                >
                  Create New Team
                </button>
              </div>
            </div>

            <div className="transition-all duration-300 ease-in-out overflow-hidden">
              <div className="p-4 px-0 rounded-xl dark:bg-[0C1015] grid md:grid-cols-2 gap-x-5">
                <div>
                  <h4 className="text-lg font-bold mb-3 dark:text-white">
                    Your Teams
                  </h4>
                  <p className="text-[#6C757D] dark:text-ink-400 mb-5 max-w-[32rem] pr-6 text-sm md:text-base">
                    Your workspaces can be deleted, renamed, team members added
                    etc depending on your permission level within the
                    organization.
                  </p>
                </div>

                <div className="w-full">
                  <div className="flex items-center px-5 py-3 text-xs font-medium text-[#6C757D] dark:text-ink-400 uppercase tracking-wider border-[#E9ECEF] dark:border-border-tertiary border-b">
                    <div className="flex-1">Workspace</div>
                    <div className="w-32 text-center">Members</div>
                    <div className="w-24 text-center">Plan</div>
                    <div className="w-10" />
                  </div>
                  <div className="space-y-0">
                    {ownedWorkspaces.map(workspace =>
                      renderWorkspaceRow(workspace, true)
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="transition-all duration-300 ease-in-out overflow-hidden mt-20">
              <div className="p-4 px-0 rounded-xl dark:bg-[0C1015] grid md:grid-cols-2 gap-x-5">
                <div>
                  <h4 className="text-lg font-bold mb-3 dark:text-white">
                    Invited Teams
                  </h4>
                  <p className="text-[#6C757D] dark:text-ink-400 mb-5 max-w-[32rem] pr-6 text-sm md:text-base ">
                    These are workspaces you've been invited to. Settings are
                    managed by the workspace owner.
                  </p>
                </div>

                <div className="w-full">
                  {invitedWorkspaces.length > 0 ? (
                    <>
                      <div className="flex items-center px-5 py-3 text-xs font-medium text-[#6C757D] dark:text-ink-400 uppercase tracking-wider">
                        <div className="flex-1">Workspace</div>
                        <div className="w-32 text-center">Members</div>
                        <div className="w-24 text-center">Plan</div>
                        <div className="w-10" />
                      </div>

                      <div className="space-y-0">
                        {invitedWorkspaces.map(workspace =>
                          renderWorkspaceRow(workspace, false)
                        )}
                      </div>
                    </>
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
            </div>
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={state.showCreateModal}
        onClose={() => setState(s => ({ ...s, showCreateModal: false }))}
        onSuccess={newWorkspaceId => {
          router.push(`/workspace/${newWorkspaceId}/settings`);
        }}
      />

      {/* Workspace Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={!!state.selectedSettingsWorkspace}
        onClose={() =>
          setState(s => ({ ...s, selectedSettingsWorkspace: null }))
        }
        workspace={state.selectedSettingsWorkspace}
        isAdmin={
          !!state.selectedSettingsWorkspace &&
          isAdminOfWorkspace(state.selectedSettingsWorkspace.id)
        }
        isCurrentWorkspace={
          state.selectedSettingsWorkspace?.id === workspaceInfo?.id
        }
        updateWorkspace={updateWorkspace}
        isUpdating={isUpdating}
        disableCustomOpenAiKey={properties.data?.disableCustomOpenAiKey}
      />
    </div>
  );
}
