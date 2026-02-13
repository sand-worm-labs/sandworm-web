"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

import { User } from "../Assets/Avatar/User";
import {
  useCurrentWorkspaceInfo,
  useSwitchWorkspace,
  useUpdateWorkspace,
  useWorkspaces,
} from "../Visualization/hooks/useWorkspaces";
import useProperties from "../Visualization/hooks/useProperties";
import { useSession } from "../Visualization/hooks/useAuth";
import { useStringQuery } from "../Visualization/hooks/useQueryArgs";

import CreateTeamModal from "./CreateTeam";
import WorkspaceSettingsModal from "./WorkspaceSettings";

export default function WorkspaceSettings() {
  const router = useRouter();

  const workspaceId = useStringQuery("workspace");

  const session = useSession({ redirectToLogin: true });
  const properties = useProperties();
  const { workspaceInfo } = useCurrentWorkspaceInfo();
  const [{ data: allWorkspaces }] = useWorkspaces();
  const { updateWorkspace, loading: isUpdating } =
    useUpdateWorkspace(workspaceId);

  console.log(allWorkspaces, "lol");

  const { switchWorkspace, loading: isSwitching } = useSwitchWorkspace();

  const [state, setState] = useState({
    isEditingName: false,
    isEditingOpenAIKey: false,
    newName: "",
    newOpenAIKey: "",
    showWorkspaceSwitcher: false,
    showCreateModal: false,
    showSettingsModal: false,
  });

  const currentWorkspace = workspaceInfo;
  const isAdmin = currentWorkspace?.role === "admin";

  const handleUpdateName = async () => {
    if (!isAdmin) {
      alert("Only admins can update workspace settings");
      return;
    }

    if (!state.newName.trim()) {
      alert("Team name cannot be empty");
      return;
    }

    try {
      await updateWorkspace(
        currentWorkspace?.id || workspaceId,
        state.newName.trim()
      );
      setState(s => ({ ...s, isEditingName: false, newName: "" }));
    } catch (err) {
      console.error("Failed to update workspace name:", err);
      alert("Failed to update team name. Please try again.");
    }
  };

  const handleSwitchWorkspace = async (targetWorkspaceId: string) => {
    try {
      const success = await switchWorkspace(targetWorkspaceId);
      if (success) {
        router.push(`/workspace/${targetWorkspaceId}/settings/account`);
        setState(s => ({ ...s, showWorkspaceSwitcher: false }));
      }
    } catch (err) {
      console.error("Failed to switch workspace:", err);
      alert("Failed to switch team. Please try again.");
    }
  };

  const handleOpenSettings = (targetWorkspaceId: string) => {
    if (targetWorkspaceId !== currentWorkspace?.id) {
      alert("Please switch to this workspace first to access its settings.");
      return;
    }
    setState(s => ({ ...s, showSettingsModal: true }));
  };

  return (
    <div className="w-full bg-white dark:bg-black h-full font-body">
      <div className="px-4 sm:p-6 lg:p-8">
        <div className="">
          <div className="pb-4 sm:flex flex-col mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-ink-100 dark:text-gray-100 mb-2">
                  Account Settings
                </h3>
                <p className="text-[#6C757D] dark:text-gray-400">
                  Manage your workspaces, settings, permissions and billings.
                </p>
              </div>

              <div className="flex gap-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setState(s => ({
                      ...s,
                      showWorkspaceSwitcher: !s.showWorkspaceSwitcher,
                    }))
                  }
                  className="flex items-center gap-2 px-5 py-1 border bg-[#F8F9FA] border-[#DEE2E6] dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Manage Invites
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setState(s => ({
                      ...s,
                      showCreateModal: true,
                      showWorkspaceSwitcher: false,
                    }))
                  }
                  className="text-primary text-left px-5 py-1.5 rounded-xl text-sm bg-[#A308F0] text-white transition-colors"
                >
                  Create New Team
                </button>
              </div>
            </div>

            <div
              className={clsx(
                "transition-all duration-300 ease-in-out overflow-hidden"
              )}
            >
              <div className="p-4 px-0 rounded-xl dark:bg-[0C1015] grid grid-cols-2 gap-x-5">
                <div>
                  <h4 className="text-lg font-bold  mb-3 dark:text-white">
                    Your Teams
                  </h4>
                  <p className="text-[#6C757D] mb-5 max-w-[32rem] pr-6">
                    Your workspaces can be deleted, renamed, team members added
                    etc depending on your permission level within the
                    organization.
                  </p>
                </div>

                <div className="w-full">
                  {/* Header */}
                  <div className="flex items-center px-5 py-3 text-xs font-medium text-[#6C757D] uppercase tracking-wider border-[#E9ECEF] border-b">
                    <div className="flex-1">Workspace</div>
                    <div className="w-32 text-center">Members</div>
                    <div className="w-24 text-center">Plan</div>
                    <div className="w-10" />
                  </div>

                  {/* Workspace rows */}
                  <div className="space-y-0">
                    {allWorkspaces.map(workspace => {
                      const isCurrentWorkspace =
                        workspace.id === currentWorkspace?.id;

                      return (
                        <div
                          key={workspace.id}
                          className={clsx(
                            "flex items-center px-5 py-4 border-b border-[#E9ECEF] dark:border-gray-800 transition-colors",
                            isCurrentWorkspace
                              ? "dark:bg-[#121417]"
                              : "hover:bg-gray-50 dark:hover:bg-[#181C21]"
                          )}
                        >
                          {/* Workspace name with avatar */}
                          <button
                            type="button"
                            onClick={() => handleSwitchWorkspace(workspace.id)}
                            disabled={isSwitching || isCurrentWorkspace}
                            className="flex-1 flex items-center gap-4 text-left cursor-pointer"
                          >
                            <User />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {workspace.name}
                            </span>
                            {isCurrentWorkspace && (
                              <span className="text-xs px-2 py-0.5 bg-[#A308F0]/10 text-[#A308F0] rounded-full">
                                Current
                              </span>
                            )}
                          </button>

                          {/* Members count */}
                          <div className="w-32 flex items-center justify-center gap-2 text-sm text-[#6C757D] font-medium dark:text-gray-400">
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
                              {workspace.memberCount || 1}{" "}
                              {workspace.memberCount === 1
                                ? "member"
                                : "members"}
                            </span>
                          </div>

                          {/* Plan badge */}
                          <div className="w-24 text-center text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {workspace.plan || "Free"}
                          </div>

                          {/* Settings icon */}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenSettings(workspace.id);
                            }}
                            disabled={!isCurrentWorkspace}
                            className={clsx(
                              "w-10 flex justify-center transition-colors",
                              isCurrentWorkspace
                                ? "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            )}
                            title={
                              isCurrentWorkspace
                                ? "Workspace settings"
                                : "Switch to this workspace to access settings"
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
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={clsx(
                "transition-all duration-300 ease-in-out overflow-hidden mt-20"
              )}
            >
              <div className="p-4 px-0 rounded-xl dark:bg-[0C1015] grid grid-cols-2 gap-x-5">
                <div>
                  <h4 className="text-lg font-bold mb-3 dark:text-white">
                    Invited Teams
                  </h4>
                  <p className="text-[#6C757D] mb-5 max-w-[32rem] pr-6">
                    Your workspaces can be deleted, renamed, team members added
                    etc depending on your permission level within the
                    organization.
                  </p>
                </div>

                <div className="w-full">
                  {/* Header */}
                  <div className="flex items-center px-5 py-3 text-xs font-medium text-[#6C757D] uppercase tracking-wider">
                    <div className="flex-1">Workspace</div>
                    <div className="w-32 text-center">Members</div>
                    <div className="w-24 text-center">Plan</div>
                    <div className="w-10" />
                  </div>

                  {/* Workspace rows */}
                  <div className="space-y-0">
                    {allWorkspaces.map(workspace => {
                      const isCurrentWorkspace =
                        workspace.id === currentWorkspace?.id;

                      return (
                        <div
                          key={workspace.id}
                          className={clsx(
                            "flex items-center px-5 py-4 border-b border-[#E9ECEF] dark:border-gray-800 transition-colors",
                            isCurrentWorkspace
                              ? "dark:bg-[#121417]"
                              : "hover:bg-gray-50 dark:hover:bg-[#181C21]"
                          )}
                        >
                          {/* Workspace name with avatar */}
                          <button
                            type="button"
                            onClick={() => handleSwitchWorkspace(workspace.id)}
                            disabled={isSwitching || isCurrentWorkspace}
                            className="flex-1 flex items-center gap-4 text-left cursor-pointer"
                          >
                            <User />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {workspace.name}
                            </span>
                            {isCurrentWorkspace && (
                              <span className="text-xs px-2 py-0.5 bg-[#A308F0]/10 text-[#A308F0] rounded-full">
                                Current
                              </span>
                            )}
                          </button>

                          {/* Members count */}
                          <div className="w-32 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                              {workspace.memberCount || 1}{" "}
                              {workspace.memberCount === 1
                                ? "member"
                                : "members"}
                            </span>
                          </div>

                          {/* Plan badge */}
                          <div className="w-24 text-center text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {workspace.plan || "Free"}
                          </div>

                          {/* Settings icon */}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleOpenSettings(workspace.id);
                            }}
                            disabled={!isCurrentWorkspace}
                            className={clsx(
                              "w-10 flex justify-center transition-colors",
                              isCurrentWorkspace
                                ? "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            )}
                            title={
                              isCurrentWorkspace
                                ? "Workspace settings"
                                : "Switch to this workspace to access settings"
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
                    })}
                  </div>
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
        onSuccess={workspaceId => {
          router.push(`/workspace/${workspaceId}/settings`);
        }}
      />

      {/* Workspace Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={state.showSettingsModal}
        onClose={() => setState(s => ({ ...s, showSettingsModal: false }))}
        workspace={currentWorkspace}
        isAdmin={isAdmin}
        updateWorkspace={updateWorkspace}
        isUpdating={isUpdating}
        disableCustomOpenAiKey={properties.data?.disableCustomOpenAiKey}
      />
    </div>
  );
}
