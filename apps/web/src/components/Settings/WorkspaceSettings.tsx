/* eslint-disable no-nested-ternary */

"use client";

import React, {
  useState,
  useEffect,
  Fragment,
  useCallback,
  useMemo,
} from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import toast from "react-hot-toast";

import type { ApiUser } from "@/types";

import { User } from "../Assets/Avatar/User";
import { PencilSimple } from "../Assets/PencilSimple";
import ManageInviteModal from "../ManageInvite";
import {
  useApproveRoleRequest,
  useDeleteWorkspace,
  useInviteUserToWorkspace,
  usePendingInvites,
  usePendingRoleRequests,
  useRejectRoleRequest,
  useWorkspaceWithMembers,
  useRemoveUserFromWorkspace,
  useUpdateWorkspaceMemberRole,
} from "../Visualization/hooks/useWorkspaces";
import { useStringQuery } from "../Visualization/hooks/useQueryArgs";
import MiniUsersList from "../Visualization/blocks/MiniUsersList";
import { useSession } from "../Visualization/hooks/useAuth";

import { WorkspaceIcon } from "./WorkspaceIcon";

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: {
    id: string;
    name: string;
    users: ApiUser;
    secrets?: {
      hasOpenAiApiKey?: boolean;
    };
  } | null;
  isAdmin: boolean;
  updateWorkspace: (id: string, name: string, icon?: string) => Promise<void>;
  isUpdating: boolean;
  disableCustomOpenAiKey?: boolean;
}
const PRESET_ICONS = [
  "red.png",
  "blue.png",
  "green.png",
  "purple.png",
  "yellow.png",
] as const;

interface EditWorkspaceProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  currentIcon?: string | null;
  onSave: (data: { name: string; selectedIcon: string | null }) => void;
  isLoading?: boolean;
}

export function EditWorkspaceProfileModal({
  isOpen,
  onClose,
  currentName = "",
  currentIcon = null,
  onSave,
  isLoading = false,
}: EditWorkspaceProfileModalProps) {
  const [workspaceName, setWorkspaceName] = useState(currentName);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(currentIcon);

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
      <div
        className="absolute inset-0 bg-[#0000001A]"
        onClick={onClose}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      <div className="relative bg-white dark:bg-base-400 dark:border dark:border-border-tertiary rounded-3xl w-full max-w-[31rem] mx-4 p-6 py-10 px-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-medium text-ink-100 dark:text-white">
            Edit workspace Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-ink-400" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-ink-100  mb-3">
            Workspace Icon
          </label>
          <div className="flex items-center gap-3">
            {/* Current selection preview */}
            <div className="relative w-14 h-14 rounded-full border-2 border-[#DEE2E6] dark:border-border-tertiary flex items-center justify-center overflow-hidden mr-4">
              {selectedIcon ? (
                <WorkspaceIcon
                  icon={selectedIcon}
                  size={56}
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] text-center text-ink-400 leading-tight">
                  No icon
                </span>
              )}
            </div>

            {PRESET_ICONS.map(colorKey => {
              const isSelected = selectedIcon === colorKey;
              return (
                <button
                  key={colorKey}
                  type="button"
                  onClick={() => setSelectedIcon(colorKey)}
                  className={`relative w-8 h-8 rounded-full transition-all overflow-hidden ${
                    isSelected
                      ? "ring-2 ring-[#A308F0] ring-offset-2 dark:ring-border-tertiary]"
                      : "hover:scale-110"
                  }`}
                  aria-label={`${colorKey.replace(".png", "")} icon`}
                >
                  <WorkspaceIcon icon={colorKey} size={32} />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-10">
          <label className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-3">
            Workspace Name
          </label>
          <input
            type="text"
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
            placeholder="Enter workspace name"
            className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] dark:bg-base-100  border border-[#DEE2E6] dark:border-border-tertiary text-ink-100 placeholder:text-[#6C757D] dark:placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-[#A308F0] focus:border-transparent transition-all text-sm font-medium"
          />
          <ul className="mt-2 space-y-1 text-xs font-medium">
            <li className="flex items-center gap-1">
              <span className="text-[#6C757D] dark:text-ink-400">·</span>
              Workspace name should be less than 40 characters
            </li>
            <li className="flex items-center gap-1">
              <span className="text-[#6C757D]  dark:text-ink-400">·</span>
              Cannot contain punctuation/special marks
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isNameValid || isLoading}
          className="w-full py-3.5 px-4 bg-[#A308F0] hover:bg-[#8a07c9] disabled:bg-[#868E96] dark:disabled:bg-[#4a4a48] text-[#E9ECEF] font-medium rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  workspaceName: string;
  isDeleting: boolean;
}

export function DeleteWorkspaceModal({
  isOpen,
  onClose,
  onDelete,
  workspaceName,
  isDeleting,
}: DeleteWorkspaceModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0000001A]" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4 font-body">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 py-8 shadow-xl relative dark:bg-base-400  border dark:border-border-tertiary ">
              <Dialog.Title className="text-lg font-medium text-ink-100">
                Delete Workspace
              </Dialog.Title>

              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-ink-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              <p className="mt-3 text-sm text-ink-100">
                You are about to delete workspace{" "}
                <span className="font-semibold text-primary">
                  {workspaceName}
                </span>
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded-xl bg-error px-6 py-2 text-sm font-medium text-[#F8F9FA] hover:bg-red-700 dark:bg-[#FF4444] "
                >
                  {isDeleting ? "Deleting Workspace" : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#DEE2E6] bg-[#F8F9FA] dark:bg-base-400 px-6 py-2 text-sm font-medium text-ink-400 hover:bg-gray-50 dark:border-border-tertiary"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: {
    id: string;
    name: string;
    icon?: string | null;
    secrets?: {
      hasOpenAiApiKey?: boolean;
    };
  } | null;
  updateWorkspace: (id: string, name: string, icon?: string) => Promise<void>;
  isUpdating: boolean;
  disableCustomOpenAiKey?: boolean;
}

export default function WorkspaceSettingsModal({
  isOpen,
  onClose,
  workspace,
  updateWorkspace,
  isUpdating,
  disableCustomOpenAiKey,
}: WorkspaceSettingsModalProps) {
  const router = useRouter();

  const {
    members,
    currentUserRole,
    isLoading: isMembersLoading,
  } = useWorkspaceWithMembers(isOpen ? workspace?.id : undefined);

  const isAdmin = currentUserRole === "admin";

  const { pendingRequests, refetch: refetchPendingRequests } =
    usePendingRoleRequests(workspace?.id ?? "");
  const { pendingInvites: rawPendingInvites, refetch: refetchInvites } =
    usePendingInvites(workspace?.id ?? "");
  const { approveRoleRequest } = useApproveRoleRequest(workspace?.id ?? "");
  const { rejectRoleRequest } = useRejectRoleRequest(workspace?.id ?? "");
  const { updateMemberRole } = useUpdateWorkspaceMemberRole(
    workspace?.id ?? ""
  );
  const { removeUser } = useRemoveUserFromWorkspace(workspace?.id ?? "");

  const [state, setState] = useState({
    isEditingName: false,
    isEditingOpenAIKey: false,
    newName: "",
    newOpenAIKey: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const currentWorkspace = useStringQuery("workspace");
  const [{ loading: isDeleting, error: deleteError }, { deleteWorkspace }] =
    useDeleteWorkspace(currentWorkspace ?? undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const mappedPendingRequests = useMemo(() => {
    return pendingRequests.map(req => ({
      id: req.userId,
      name: req.user
        ? `${req.user.firstName ?? ""} ${req.user.lastName ?? ""}`.trim() ||
          req.user.username ||
          req.user.email
        : req.userId,
      email: req.user?.email ?? "",
      requestedRole: req.requestedRole ?? "editor",
      requestedAt: new Date(),
    }));
  }, [pendingRequests]);

  const mappedPendingInvites = useMemo(() => {
    return rawPendingInvites.map(invite => ({
      id: invite.userId,
      name: invite.user
        ? `${invite.user.firstName ?? ""} ${invite.user.lastName ?? ""}`.trim() ||
          invite.user.username ||
          invite.user.email
        : invite.userId,
      email: invite.user?.email ?? "",
      role: invite.role,
      invitedAt: new Date(),
    }));
  }, [rawPendingInvites]);

  const handleApproveRequest = async (userId: string) => {
    await approveRoleRequest(userId);
    refetchPendingRequests();
  };

  const handleDenyRequest = async (userId: string) => {
    await rejectRoleRequest(userId);
    refetchPendingRequests();
  };

  const { inviteUser } = useInviteUserToWorkspace(workspace?.id);

  const handleSendInvite = async (
    email: string,
    role: UserRole,
    workspaceId: string
  ) => {
    const success = await inviteUser(email, workspaceId, role);
    if (success) {
      toast.success(`Invitation sent to ${email}`);
      refetchInvites();
    } else {
      toast.error("Failed to send invitation");
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const onChangeRole = useCallback(
    async (id: string, role: UserWorkspaceRole) => {
      try {
        await updateMemberRole(id, role);
        toast.success("Role updated successfully");
      } catch (err) {
        toast.error("Failed to update role");
      }
    },
    [updateMemberRole]
  );

  const onRemoveUser = useCallback(
    async (id: string) => {
      try {
        await removeUser(id);
        toast.success("User removed from workspace");
      } catch (err) {
        toast.error("Failed to remove user");
      }
    },
    [removeUser]
  );

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

  if (!isOpen || !workspace) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-[#0000001A]"
            onClick={onClose}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClose();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          />
        </Transition.Child>

        <div className="flex min-h-full items-center justify-center p-4 lg:min-w-[1000px] w-auto">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative w-full max-w-[1000px] xl:max-w-[1300px] transform rounded-2xl bg-white dark:bg-base-400 dark:border dark:border-border-tertiary shadow-none transition-all px-12">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 pt-12">
                <div>
                  <div className="flex gap-x-3">
                    <WorkspaceIcon icon={workspace?.icon} />
                    <h2 className="text-base font-semibold text-ink-100 dark:text-white capitalize flex items-center gap-2">
                      {workspace?.name} workspace
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-1 rounded transition-colors"
                      >
                        <PencilSimple className="h-4 w-4  dark:text-ink-400" />
                      </button>
                    </h2>

                    <div className="w-32 flex items-center justify-center gap-2 text-sm text-[#6C757D]  font-medium dark:text-ink-400 border-r border-[#1A1A1A]">
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
                        {isMembersLoading ? "..." : members.length}{" "}
                        {members.length === 1 ? "member" : "members"}
                      </span>
                    </div>

                    <div className="px-3 flex items-center justify-center gap-2 text-sm text-[#6C757D] font-medium dark:text-ink-400 border-r border-[#1A1A1A]">
                      Pro
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 px-2.5 py-0.5 border bg-[#F8F9FA] border-[#DEE2E6] dark:text-black dark:border-border-tertiary rounded-lg text-xs font-medium hover:bg-gray-50  transition-colors"
                    >
                      Manage Invites
                    </button>

                    <div className="text-primary text-[13px] font-medium">
                      {mappedPendingRequests.length} Pending Requests
                    </div>

                    <div className="text-primary text-[13px] font-medium">
                      {mappedPendingInvites.length} Pending Invites
                    </div>
                  </div>

                  <p className="text-xs xl:text-sm mt-2 text-[#6C757D] dark:text-ink-400">
                    Change details about your workspace
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1 text-ink-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-0 div dark:divide-border-tertiary">
                {/* Team Plan */}
                <div className="flex items-center justify-between gap-4 py-4 border-[#E9ECEF]">
                  <div className="flex flex-col gap-y-2">
                    <label className="block text-md font-bold leading-4 dark:text-white text-ink-100">
                      Team plan
                    </label>
                    <p className="text-xs xl:text-sm mt-2 text-[#6C757D] dark:text-ink-400">
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
                        className="px-2.5 py-1 border border-[#DEE2E6] dark:border-gray-700 dark:text-black bg-[#F8F9FA] rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 text-xs"
                      >
                        Change Plan
                      </button>
                    </div>
                  </div>

                  <div className="flex w-[50%] justify-between border-b border-[#E9ECEF] pb-2 dark:border-border-tertiary ">
                    <div className="flex">
                      <div>
                        <div className="text-[13px] uppercase text-[#6C757D] dark:text-ink-400 font-bold block mb-2.5">
                          Current plan
                        </div>
                        <div className="font-medium capitalize bg-[#F7E8FF] dark:bg-[#2a1a3a] px-3 py-0.5 rounded-md text-primary inline-block text-sm">
                          Free
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[13px] uppercase text-[#6C757D] dark:text-ink-400 font-bold block mb-2.5">
                        Available AI Credit
                      </div>
                      <div className="font-medium text-[#6C757D] dark:text-ink-400 capitalize px-2 py-0.5 block inline-block text-sm">
                        0
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Model Selection */}
                <div className="flex items-center justify-between gap-4 py-4">
                  <div className="flex flex-col gap-y-2">
                    <label className="block text-md font-bold leading-4 dark:text-white text-ink-100">
                      AI Configuration
                    </label>
                    <span className="text-xs xl:text-sm mt-2 text-[#6C757D] dark:text-ink-400">
                      Select the default AI model for your team workspace
                    </span>
                  </div>

                  <div className="w-[50%]">
                    <div className="text-[13px] uppercase text-[#6C757D] dark:text-ink-400 font-bold block mb-1.5">
                      Model
                    </div>
                    <select
                      className="block w-full rounded-[10px] xl:py-2 border-0 py-1.5 pl-4 pr-10 text-ink-100 font-medium ring-1 ring-inset ring-[#CED4DA] focus:ring-1 focus:ring-[#A308F0] text-sm dark:bg-base-400 disabled:bg-gray-100 dark:text-white dark:ring-border-tertiary"
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
                      <span className="text-xs xl:text-sm mt-2 text-[#6C757D] dark:text-ink-400">
                        Set a custom API key for your workspace
                      </span>
                    </div>

                    <div className="w-[50%]">
                      <div className="text-[13px] uppercase text-[#6C757D] dark:text-ink-400 font-bold block mb-1.5">
                        set key
                      </div>
                      <select
                        className="block w-full rounded-[10px] xl:py-2 border-0 py-1.5 pl-4 pr-10 text-ink-100 font-medium ring-1 ring-inset ring-[#CED4DA] focus:ring-1 focus:ring-[#A308F0] text-sm dark:bg-base-400 disabled:bg-gray-100 dark:text-white dark:ring-border-tertiary"
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

                {/* Members */}
                <div className="flex items-start justify-between gap-4 py-4">
                  <div className="flex flex-col gap-y-2">
                    <label className="block text-md font-bold leading-4 dark:text-white text-ink-100">
                      Members
                    </label>
                    <span className="text-xs xl:text-sm mt-2 text-[#6C757D] dark:text-ink-400">
                      Manage access levels for users within this workspace
                    </span>
                  </div>

                  <div className="w-[50%]">
                    <MiniUsersList
                      currentUserEmail={
                        members.find(m => m.role === currentUserRole)?.email ??
                        ""
                      }
                      users={members}
                      onRemoveUser={onRemoveUser}
                      onChangeRole={onChangeRole}
                      onInvite={() => {}}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between gap-3 px-6 py-4 mb-20">
                <div>
                  <h3 className="text-ink-100 font-bold">Delete Workspace</h3>
                  <p className="text-xs xl:text-sm mt-2 text-[#6C757D] dark:text-ink-400">
                    Delete this Workspace
                  </p>
                </div>

                <div className="w-[50%]">
                  <h3 className="uppercase mb-2 text-[#6C757D]  dark:text-ink-400 font-bold text-[13px]">
                    Delete this workspace
                  </h3>
                  <div className="flex bg-[#FFDBDB] dark:bg-[#2a1a1a] border border-[#CED4DA] dark:border-[#5a2e2e] rounded-xl text-[13px] py-1 px-2 items-center gap-x-5 justify-between">
                    <span className="inline-block text-[#ff0000] dark:text-[#ff6b6b]">
                      Once deleted, all files, users and data will be
                      permanently lost
                    </span>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      type="button"
                      className="bg-[#F8F9FA] dark:bg-base-400 text-[12px] py-1 px-2 rounded-lg border border-[#DEE2E6] dark:border-border-tertiary text-[#ff0000] dark:text-[#ff6b6b]  font-medium inline-block"
                    >
                      Delete Workspace
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>

        <ManageInviteModal
          isOpen={isModalOpen}
          workspaceId={workspace?.id}
          onClose={() => setIsModalOpen(false)}
          pendingInvites={mappedPendingInvites}
          onSendInvite={handleSendInvite}
          onCancelInvite={handleCancelInvite}
          pendingRequests={mappedPendingRequests}
          refetchInvite={refetchInvites}
          onApproveRequest={handleApproveRequest}
          onDenyRequest={handleDenyRequest}
        />

        <DeleteWorkspaceModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={async () => {
            try {
              await deleteWorkspace(workspace?.id ?? "");
              setIsDeleteModalOpen(false);
              onClose();
            } catch (error) {
              console.error("Failed to delete workspace:", error);
            }
          }}
          workspaceName={workspace?.name}
          isDeleting={isDeleting}
          errorMessage={
            deleteError === "current_workspace"
              ? "You cannot delete the workspace you are currently in."
              : deleteError === "last_workspace"
                ? "You cannot delete your last workspace."
                : deleteError === "unauthorized"
                  ? "You must be an admin to delete this workspace."
                  : deleteError === "unexpected"
                    ? "Something went wrong. Please try again."
                    : undefined
          }
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
              await updateWorkspace(
                workspace?.id || "",
                name.trim(),
                selectedIcon ?? undefined
              );
              setIsEditModalOpen(false);
            } catch (err) {
              console.error("Failed to update workspace name:", err);
              alert("Failed to update team name. Please try again.");
            }
          }}
          isLoading={isUpdating}
        />
      </div>
    </Transition>
  );
}
