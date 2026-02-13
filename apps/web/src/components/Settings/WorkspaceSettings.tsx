"use client";

import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  XMarkIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

import { User } from "../Assets/Avatar/User";
import { PencilSimple } from "../Assets/PencilSimple";
import ManageInviteModal from "../ManageInvite";

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: {
    id: string;
    name: string;
    secrets?: {
      hasOpenAiApiKey?: boolean;
    };
  } | null;
  isAdmin: boolean;
  updateWorkspace: (id: string, name: string) => Promise<void>;
  isUpdating: boolean;
  disableCustomOpenAiKey?: boolean;
}

export default function WorkspaceSettingsModal({
  isOpen,
  onClose,
  workspace,
  isAdmin,
  updateWorkspace,
  isUpdating,
  disableCustomOpenAiKey,
}: WorkspaceSettingsModalProps) {
  const router = useRouter();

  const [state, setState] = useState({
    isEditingName: false,
    isEditingOpenAIKey: false,
    newName: "",
    newOpenAIKey: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data
  const workspaceMembers: WorkspaceMember[] = [
    {
      id: "1",
      name: "James Earl",
      email: "james@example.com",
      role: "editor",
    },
    {
      id: "2",
      name: "Camila Houst",
      email: "camila@example.com",
      role: "owner",
    },
  ];

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    {
      id: "1",
      name: "Simon Cyril",
      email: "Simoncyril@gmail.com",
      role: "editor",
      invitedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
    },
    {
      id: "2",
      name: "Alejandro Rajaonarimampianina",
      email: "AlejandroRajaonarimampianina@gmail.com",
      role: "editor",
      invitedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      name: "Alejandro Rajaonarimampianina",
      email: "AlejandroRajaonarimampianina@gmail.com",
      role: "editor",
      invitedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
    },
  ]);

  // Handlers
  const handleSendInvite = async (email: string, role: UserRole) => {
    console.log("Sending invite to:", email, "with role:", role);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add to pending invites
    const newInvite: PendingInvite = {
      id: Date.now().toString(),
      name: email.split("@")[0],
      email,
      role,
      invitedAt: new Date(),
    };

    setPendingInvites(prev => [...prev, newInvite]);
  };

  const handleCancelInvite = async (inviteId: string) => {
    console.log("Cancelling invite:", inviteId);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Remove from pending invites
    setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setState({
        isEditingName: false,
        isEditingOpenAIKey: false,
        newName: "",
        newOpenAIKey: "",
      });
    }
  }, [isOpen]);

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
      await updateWorkspace(workspace?.id || "", state.newName.trim());
      setState(s => ({ ...s, isEditingName: false, newName: "" }));
    } catch (err) {
      console.error("Failed to update workspace name:", err);
      alert("Failed to update team name. Please try again.");
    }
  };

  if (!isOpen || !workspace) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0000001A] transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 lg:min-w-[1000px]  w-auto">
        <div className="relative w-full max-w-[1000px] xl:max-w-[1300px] transform rounded-2xl bg-white dark:bg-[#0D1014] shadow-none transition-all px-12">
          {/* Header */}
          <div className="flex items-center justify-between  px-6 py-4 pt-12 ">
            <div>
              <div className="flex gap-x-3">
                <User />
                <h2 className="text-base font-semibold text-ink-100 dark:text-white capitalize flex items-center gap-2">
                  {workspace?.name} workspace
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-1 rounded  transition-colors"
                  >
                    <PencilSimple className="h-4 w-4 text-gray-500" />
                  </button>
                </h2>

                {/* Members count */}
                <div className="w-32 flex items-center justify-center gap-2 text-sm text-[#6C757D] font-medium dark:text-gray-400 border-r border-[#1A1A1A]">
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
                    {workspace.memberCount === 1 ? "member" : "members"}
                  </span>
                </div>

                <div className="px-3 flex items-center justify-center gap-2 text-sm text-[#6C757D] font-medium dark:text-gray-400 border-r border-[#1A1A1A]">
                  Pro
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-2.5 py-0.5 border bg-[#F8F9FA] border-[#DEE2E6] dark:border-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Manage Invites
                </button>

                <div className="text-primary text-[13px] font-medium">
                  0 Pending Requests
                </div>

                <div className="text-primary text-[13px] font-medium">
                  0 Pending Invites
                </div>
              </div>

              <p className="text-xs xl:text-sm mt-2 text-[#6C757D]">
                Change details about your workspace
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-0 div dark:divide-[#262A30]">
            {/* Team Name */}
            {/*   <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex flex-col gap-y-2">
                <label className="block text-md font-medium leading-6 dark:text-white">
                  Team name
                </label>
                <span className="text-xs text-gray-400">
                  This name appears on invites and will be displayed to you and
                  your team members.
                </span>
              </div>

              <div className="flex-1 max-w-xs flex items-center justify-end">
                {state.isEditingName ? (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleUpdateName();
                    }}
                    className="flex gap-x-2 items-center w-full"
                  >
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-ink-300 placeholder-[#455768] focus:outline-none focus:border-[#A308F0] transition text-sm bg-[#F1F3F4]"
                      value={state.newName}
                      onChange={e =>
                        setState(s => ({ ...s, newName: e.target.value }))
                      }
                      placeholder="My Team"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setState(s => ({ ...s, isEditingName: false }))
                      }
                      className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm whitespace-nowrap"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating || !state.newName.trim()}
                      className="px-4 py-1.5 bg-[#A308F0] text-white rounded-lg hover:bg-[#8a07c9] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                    >
                      {isUpdating ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-x-4">
                    <span className="text-sm dark:text-white text-gray-700">
                      {workspace?.name}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        className="flex gap-x-1.5 items-center px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                        onClick={() =>
                          setState(s => ({
                            ...s,
                            newName: workspace?.name ?? "",
                            isEditingName: true,
                          }))
                        }
                      >
                        <PencilIcon className="h-3 w-3" />
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div> */}

            {/* Team Plan */}
            <div className="flex items-center justify-between gap-4 py-4 border-[#E9ECEF]">
              <div className="flex flex-col gap-y-2">
                <label className="block text-md font-bold leading-4 dark:text-white text-ink-100">
                  Team plan
                </label>

                <p className="text-xs xl:text-sm mt-2 text-[#6C757D]">
                  Check your current billing status
                </p>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      router.push(
                        `/workspace/${workspace?.id}/settings/billing`
                      );
                      onClose();
                    }}
                    className="px-2.5 py-1 border border-[#DEE2E6] dark:border-gray-700 bg-[#F8F9FA] rounded-lg font-medium  hover:bg-gray-50 dark:hover:bg-gray-800 text-xs"
                  >
                    Change Plan
                  </button>
                </div>
              </div>

              <div className="flex border-b  ">
                <div>
                  <div className="text-[13px] uppercase text-[#6C757D] font-bold block mb-2.5">
                    Current plan
                  </div>
                  <div className="font-medium capitalize bg-[#F7E8FF] px-3 py-0.5 rounded-md text-[#A308F0] inline-block text-sm">
                    Free
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[13px] uppercase text-[#6C757D] font-bold block mb-2.5">
                  Available AI Credit
                </div>
                <div className="font-medium capitalize  px-2 py-0.5 block  inline-block text-sm">
                  0
                </div>
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex flex-col gap-y-2">
                <label className="block text-md font-bold leading-4 dark:text-white text-ink-100 ">
                  AI Configuration
                </label>
                <span className="text-xs xl:text-sm mt-2 text-[#6C757D]">
                  Select the default AI model for your team workspace
                </span>
              </div>

              <div className="w-[50%]">
                <div className=" text-[13px] uppercase text-[#6C757D] font-bold block mb-1.5">
                  Model
                </div>
                <select
                  className="block w-full rounded-[10px] xl:py-2 border-0 py-1.5 pl-4 pr-10 text-ink-100 font-medium ring-1 ring-inset ring-[#CED4DA] focus:ring-1 focus:ring-[#A308F0] text-sm dark:bg-[#0D1014] disabled:bg-gray-100 dark:text-white dark:ring-[#262A30]"
                  defaultValue="gpt-4o"
                >
                  <option value="gpt-4o">GPT-4o (Recommended)</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
            </div>

            {/* Custom OpenAI API Key */}
            {!disableCustomOpenAiKey && (
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex flex-col gap-y-2">
                  <label className="block text-md font-bold leading-4 dark:text-white text-ink-100">
                    Custom AI API Key
                  </label>
                  <span className="text-xs xl:text-sm mt-2 text-[#6C757D]">
                    Set a custom API key for your workspace
                  </span>
                </div>

                <div className="w-[50%]">
                  <div className=" text-[13px] uppercase text-[#6C757D] font-bold block mb-1.5">
                    set key
                  </div>
                  <select
                    className="block w-full rounded-[10px] xl:py-2 border-0 py-1.5 pl-4 pr-10 text-ink-100 font-medium ring-1 ring-inset ring-[#CED4DA] focus:ring-1 focus:ring-[#A308F0] text-sm dark:bg-[#0D1014] disabled:bg-gray-100 dark:text-white dark:ring-[#262A30]"
                    defaultValue="gpt-4o"
                  >
                    <option value="gpt-4o">
                      Not set - Using sandworm default quotas
                    </option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 py-4 ">
              <div className="flex flex-col gap-y-2">
                <label className="block text-md font-bold leading-4 dark:text-white text-ink-100 ">
                  Members
                </label>
                <span className="text-xs xl:text-sm mt-2 text-[#6C757D]">
                  Manage access levels for users within this workspace
                </span>
              </div>

              <div className=" border border-[#DEE2E6]  min-h-[12rem] w-[50%]  rounded-[10px]" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between gap-3  px-6 py-4 mb-20">
            <div>
              <h3 className="text-ink-100 font-bold"> Delete Workspace</h3>
              <p className="text-xs xl:text-sm mt-2 text-[#6C757D]">
                Delete this Workspace
              </p>
            </div>

            <div className="">
              <h3 className="uppercase mb-2 text-[#6C757D] font-bold text-[13px]">
                Delete this workspace
              </h3>
              <div className="flex bg-[#FFDBDB] border border-[#CED4DA] rounded-xl text-[13px] py-1 px-2 items-center gap-x-5">
                <span className="inline-block text-[#ff0000]">
                  Once deleted, all files, users and data will be permanently
                  lost
                </span>
                <button
                  type="button"
                  className="bg-[#F8F9FA] text-[12px] py-1 px-2 rounded-lg border border-[#DEE2E6] text-[#ff0000] font-medium inline-block"
                >
                  Delete Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ManageInviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceMembers={workspaceMembers}
        pendingInvites={pendingInvites}
        onSendInvite={handleSendInvite}
        onCancelInvite={handleCancelInvite}
      />

      <EditWorkspaceProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={workspace?.name}
        onSave={async ({ name, selectedIcon }) => {
          if (!isAdmin) {
            alert("Only admins can update workspace settings");
            return;
          }

          try {
            await updateWorkspace(workspace?.id || "", name.trim());
            setIsEditModalOpen(false);
          } catch (err) {
            console.error("Failed to update workspace name:", err);
            alert("Failed to update team name. Please try again.");
          }
        }}
        isLoading={isUpdating}
      />
    </div>
  );
}

interface EditWorkspaceProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  onSave: (data: { name: string; selectedIcon: number | null }) => void;
  isLoading?: boolean;
}

const PRESET_ICONS = [
  { id: 1, gradient: "linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%)" },
  { id: 2, gradient: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" },
  { id: 3, gradient: "linear-gradient(135deg, #F97316 0%, #FBBF24 100%)" },
  { id: 4, gradient: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" },
  { id: 5, gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" },
];

export function EditWorkspaceProfileModal({
  isOpen,
  onClose,
  currentName = "",
  onSave,
  isLoading = false,
}: EditWorkspaceProfileModalProps) {
  const [workspaceName, setWorkspaceName] = useState(currentName);
  const [selectedIcon, setSelectedIcon] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ name: workspaceName, selectedIcon });
  };

  const isNameValid =
    workspaceName.trim().length > 0 &&
    workspaceName.length <= 40 &&
    !/[^\w\s]/.test(workspaceName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-medium text-ink-100 dark:text-white">
            Edit workspace Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Workspace Profile Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Workspace Profile
          </label>
          <div className="flex items-center gap-3">
            {/* Upload Button */}
            <button
              type="button"
              className="relative w-14 mr-4 h-14 rounded-full border-2  border-[#DEE2E6] dark:border-gray-600 hover:border-[#A308F0] dark:hover:border-[#A308F0] transition-colors flex items-center justify-center group"
            >
              <span className="text-[10px] text-center text-gray-500 dark:text-gray-400 group-hover:text-[#A308F0] leading-tight">
                Click to
                <br />
                Upload
              </span>
            </button>

            {/* Preset Icons */}
            {PRESET_ICONS.map(icon => (
              <button
                key={icon.id}
                type="button"
                onClick={() => setSelectedIcon(icon.id)}
                className={`w-8 h-8 rounded-full transition-all ${
                  selectedIcon === icon.id
                    ? "ring-2 ring-[#A308F0] ring-offset-2 dark:ring-offset-[#1A1A1A]"
                    : "hover:scale-110"
                }`}
                style={{ background: icon.gradient }}
              />
            ))}
          </div>
        </div>

        {/* Workspace Name Section */}
        <div className="mb-10">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Workspace Name
          </label>
          <input
            type="text"
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
            placeholder="Enter workspace name"
            className="w-full px-4 py-3 rounded-lg bg-[#F8F9FA] dark:bg-[#262626] border border-[#DEE2E6] dark:border-[#363636] text-gray-900 dark:text-white placeholder:text-[#6C757D] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A308F0] focus:border-transparent transition-all text-sm font-medium"
          />
          <ul className="mt-2 space-y-1 text-xs font-medium">
            <li className="flex items-center gap-1">
              <span className="text-[#6C757D]">·</span>
              Workspace name should be less than 40 characters
            </li>
            <li className="flex items-center gap-1">
              <span className="text-[#6C757D]">·</span>
              Cannot contain punctuation/special marks
            </li>
          </ul>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isNameValid || isLoading}
          className="w-full py-3 px-4 bg-[#A308F0] hover:bg-[#8a07c9] disabled:bg-[#868E96] text-white font-medium rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
