/* eslint-disable no-nested-ternary */

"use client";

import React, { useState, useEffect, Fragment } from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";

import { User } from "../Assets/Avatar/User";
import { PencilSimple } from "../Assets/PencilSimple";
import ManageInviteModal from "../ManageInvite";
import { useDeleteWorkspace } from "../Visualization/hooks/useWorkspaces";
import { useStringQuery } from "../Visualization/hooks/useQueryArgs";

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

interface EditWorkspaceProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  onSave: (data: { name: string; selectedIcon: string | null }) => void;
  isLoading?: boolean;
}

const PRESET_ICONS = [
  { id: 1, src: "/img/avatar-1.svg" },
  { id: 2, src: "/img/avatar-2.svg" },
  { id: 3, src: "/img/avatar-3.svg" },
  { id: 4, src: "/img/avatar-4.svg" },
  { id: 5, src: "/img/avatar-5.svg" },
];

export function EditWorkspaceProfileModal({
  isOpen,
  onClose,
  currentName = "",
  onSave,
  isLoading = false,
}: EditWorkspaceProfileModalProps) {
  const [workspaceName, setWorkspaceName] = useState(currentName);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);


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

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-xl w-full max-w-[31rem] mx-4 p-6 py-10 px-10">
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
          <label className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-3">
            Workspace Profile
          </label>
          <div className="flex items-center gap-3">
            {/* Upload Button / Selected Preview */}
            <button
              type="button"
              className="relative w-14 mr-4 h-14 rounded-full border-2 border-[#DEE2E6] dark:border-gray-600 hover:border-[#A308F0] dark:hover:border-[#A308F0] transition-colors flex items-center justify-center group overflow-hidden"
            >
              {selectedIcon ? (
                <Image
                  src={selectedIcon}
                  alt="Selected workspace icon"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] text-center text-gray-500 dark:text-gray-400 group-hover:text-[#A308F0] leading-tight">
                  Click to
                  <br />
                  Upload
                </span>
              )}
            </button>

            {/* Preset Icons */}
            {PRESET_ICONS.map(icon => {
              const isSelected = selectedIcon === icon.src;
              return (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setSelectedIcon(icon.src)}
                  className={`relative w-8 h-8 rounded-full transition-all overflow-hidden ${
                    isSelected
                      ? "ring-2 ring-[#A308F0] ring-offset-2 dark:ring-offset-[#1A1A1A]"
                      : "hover:scale-110"
                  }`}
                >
                  <Image
                    src={icon.src}
                    alt={`Avatar option ${icon.id}`}
                    fill
                    className="object-cover"
                  />
                  {/* Checkmark Indicator */}
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

        {/* Workspace Name Section */}
        <div className="mb-10">
          <label className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-3">
            Workspace Name
          </label>
          <input
            type="text"
            value={workspaceName}
            onChange={e => setWorkspaceName(e.target.value)}
            placeholder="Enter workspace name"
            className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] dark:bg-[#262626] border border-[#DEE2E6] dark:border-[#363636] text-gray-900 dark:text-white placeholder:text-[#6C757D] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A308F0] focus:border-transparent transition-all text-sm font-medium"
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
          className="w-full py-3.5 px-4 bg-[#A308F0] hover:bg-[#8a07c9] disabled:bg-[#868E96] text-[#E9ECEF] font-medium rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
            <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 py-8 shadow-xl relative">
              <Dialog.Title className="text-lg font-medium text-ink-100">
                Delete Workspace
              </Dialog.Title>

              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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
                  className="rounded-xl bg-error px-6 py-2 text-sm font-medium text-[#F8F9FA] hover:bg-red-700"
                >
                  {isDeleting ? "Deleting Workspace" : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#DEE2E6] bg-[#F8F9FA] px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const currentWorkspace = useStringQuery("workspace")
  const [{ loading: isDeleting, error: deleteError }, { deleteWorkspace }] =
  useDeleteWorkspace(currentWorkspace ?? undefined);

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
      invitedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
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
      invitedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    },
  ]);

  const handleSendInvite = async (email: string, role: UserRole) => {
    console.log("Sending invite to:", email, "with role:", role);

    await new Promise(resolve => setTimeout(resolve, 1000));

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

    await new Promise(resolve => setTimeout(resolve, 500));

    setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#0000001A] transition-opacity"
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
                  onClick={() => setIsDeleteModalOpen(true)}
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
        pendingRequests={[
          {
            id: "req-1",
            name: "Simon Peters",
            email: "simon@example.com",
            requestedRole: "editor",
            requestedAt: new Date(),
            message: "I'd like to help with the dashboard",
          },
        ]}
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
          console.log(selectedIcon);
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
