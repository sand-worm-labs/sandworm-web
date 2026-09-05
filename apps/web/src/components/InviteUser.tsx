"use client";

import React, { useState, useCallback, Fragment } from "react";
import {
  DialogPanel,
  DialogTitle,
  Dialog,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import type { UserWorkspaceRole } from "@/types";
import { CloseIconButton } from "@/components/CloseIconButton";
import { tintPillDarkClassName } from "@/styles/interactive";

// =====================================
// ⬢ Types
// =====================================
interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  workspaceId?: string;
  workspaces?: { id: string; name: string }[];
  onInvite: (
    email: string,
    role: UserWorkspaceRole,
    workspaceId: string
  ) => Promise<void>;
}

// =====================================
// ⬢ Invite User Modal
// =====================================
export default function InviteUserModal({
  isOpen,
  onClose,
  workspaceName,
  workspaceId,
  workspaces,
  onInvite,
}: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserWorkspaceRole>("editor");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(
    workspaceId ?? workspaces?.[0]?.id ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isMultiWorkspace = !!workspaces?.length;

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setEmail("");
      setRole("editor");
      setError("");
      setSelectedWorkspaceId(workspaceId ?? workspaces?.[0]?.id ?? "");
      onClose();
    }
  }, [isSubmitting, onClose, workspaceId, workspaces]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email.trim()) {
        setError("Email is required");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      if (isMultiWorkspace && !selectedWorkspaceId) {
        setError("Please select a workspace");
        return;
      }

      setIsSubmitting(true);
      setError("");

      try {
        const targetWorkspaceId = isMultiWorkspace
          ? selectedWorkspaceId
          : workspaceId;
        if (!targetWorkspaceId) return;

        await onInvite(email, role, targetWorkspaceId);
        setEmail("");
        setRole("editor");
        setSelectedWorkspaceId(workspaceId ?? workspaces?.[0]?.id ?? "");
        onClose();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send invitation"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      email,
      role,
      selectedWorkspaceId,
      isMultiWorkspace,
      workspaceId,
      workspaces,
      onInvite,
      onClose,
    ]
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/[10.2%] dark:bg-base-100/20" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto font-body ">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white dark:bg-dropdown-bg py-10 px-8 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-7">
                  <DialogTitle
                    as="h3"
                    className="text-base font-medium leading-6 text-ink-100 dark:text-white"
                  >
                    {isMultiWorkspace
                      ? "Invite to workspace"
                      : `Invite to ${workspaceName}`}
                  </DialogTitle>
                  <CloseIconButton
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="disabled:opacity-50 disabled:pointer-events-none"
                  />
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                  {isMultiWorkspace && (
                    <div className="mb-4">
                      <label
                        htmlFor="workspace"
                        className="block text-sm font-medium text-ink-100 dark:text-gray-300 mb-2"
                      >
                        Workspace
                      </label>
                      <select
                        id="workspace"
                        value={selectedWorkspaceId}
                        onChange={e => setSelectedWorkspaceId(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 rounded-xl dark:bg-base-400 border dark:border-border-tertiary border-border dark:text-white focus:outline-none focus:ring focus:ring-primary transition text-xs md:text-sm bg-inputBg"
                      >
                        <option value="">Select a workspace</option>
                        {workspaces.map(ws => (
                          <option key={ws.id} value={ws.id}>
                            {ws.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-ink-100 dark:text-gray-300 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="colleague@example.com"
                      disabled={isSubmitting}
                      className="w-full px-5 py-3.5 rounded-xl dark:bg-base-400 border dark:border-border-tertiary border-border dark:text-white placeholder:dark:text-ink-300 placeholder-[#868E96] focus:outline-none focus:ring focus:ring-primary transition text-xs md:text-sm bg-inputBg"
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-ink-100 dark:text-gray-300 mb-2"
                    >
                      Select role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={e =>
                        setRole(e.target.value as UserWorkspaceRole)
                      }
                      disabled={isSubmitting}
                      className="w-auto px-3 py-1 rounded-lg dark:bg-base-400 border dark:border-border-tertiary border-border dark:text-white focus:outline-none focus:ring focus:ring-primary transition text-xs md:text-sm bg-inputBg"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {error && <p className="mb-4 text-sm text-error ">{error}</p>}

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !email.trim() ||
                        (isMultiWorkspace && !selectedWorkspaceId)
                      }
                      className={`flex-1 px-4 py-3.5 text-sm font-medium text-white bg-primary rounded-[16px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent ${tintPillDarkClassName}`}
                    >
                      {isSubmitting ? "Sending..." : "Send invite"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
