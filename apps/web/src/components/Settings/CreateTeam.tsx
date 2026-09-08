"use client";

import { useState, Fragment } from "react";
import {
  DialogPanel,
  DialogTitle,
  Dialog,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";

import {
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
} from "@/generated/graphql";
import { CloseIconButton } from "@/components/CloseIconButton";
import { tintPillDarkClassName } from "@/styles/interactive";

import { PRESET_ICONS } from "./EditWorkspaceProfileModal";
import { WorkspaceIcon } from "./WorkspaceIcon";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (workspaceId: string) => void;
}

// =====================================
// ⬢ Create Team Modal
// =====================================
export default function CreateTeamModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTeamModalProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const [createWorkspace, { loading: creating }] = useCreateWorkspaceMutation();
  const [updateWorkspace, { loading: applyingIcon }] =
    useUpdateWorkspaceMutation();
  const loading = creating || applyingIcon;

  const isLengthValid =
    workspaceName.trim().length > 0 && workspaceName.length <= 40;
  const hasNoInvalidChars = !/[^\w\s']/.test(workspaceName);
  const isNameValid = isLengthValid && hasNoInvalidChars;

  const resetForm = () => {
    setWorkspaceName("");
    setSelectedIcon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNameValid) {
      return;
    }

    try {
      const result = await createWorkspace({
        variables: {
          name: workspaceName.trim(),
        },
      });

      const workspaceId = result.data?.createWorkspace?.id;

      if (workspaceId) {
        if (selectedIcon) {
          await updateWorkspace({
            variables: { workspaceId, icon: selectedIcon },
          });
        }
        onSuccess?.(workspaceId);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

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
          <div className="fixed inset-0 bg-black/[10.2%]" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto font-body">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative bg-white dark:bg-dropdown-bg dark:border dark:border-border-tertiary rounded-3xl w-full max-w-md  mx-4 p-6 py-10 px-10 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle
                    as="h2"
                    className="text-base font-medium text-ink-100 dark:text-white"
                  >
                    Create New Team
                  </DialogTitle>
                  <CloseIconButton
                    onClick={handleClose}
                    disabled={loading}
                    className="disabled:opacity-50 disabled:pointer-events-none"
                  />
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-ink-100 mb-3">
                      Workspace Icon
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-full border-2 border-border dark:border-border-tertiary flex items-center justify-center overflow-hidden mr-4">
                        <WorkspaceIcon
                          icon={selectedIcon}
                          size={56}
                          className="object-cover"
                        />
                      </div>

                      {PRESET_ICONS.map(colorKey => {
                        const isSelected = selectedIcon === colorKey;
                        return (
                          <button
                            key={colorKey}
                            type="button"
                            onClick={() => setSelectedIcon(colorKey)}
                            disabled={loading}
                            className={`relative w-8 h-8 rounded-full transition-all overflow-hidden ${
                              isSelected
                                ? "ring-2 ring-primary ring-offset-2 dark:ring-border-tertiary"
                                : "hover:scale-110"
                            }`}
                            aria-label={`${colorKey.replace(".png", "")} icon`}
                          >
                            <WorkspaceIcon icon={colorKey} size={48} />
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
                    <label
                      htmlFor="team-name"
                      className="block text-sm font-medium text-ink-100 dark:text-gray-300 mb-3"
                    >
                      Workspace Name
                    </label>
                    <input
                      id="team-name"
                      type="text"
                      required
                      placeholder="e.g., Defi Team"
                      value={workspaceName}
                      onChange={e => setWorkspaceName(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-inputBg dark:bg-base-400 border border-border dark:border-border-tertiary text-ink-100 dark:text-white placeholder:text-ink-400 dark:placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium"
                    />
                    <ul className="mt-2 space-y-1 text-xs font-medium">
                      <li
                        className={`flex items-center gap-1 ${
                          workspaceName.length > 40
                            ? "text-red-500 dark:text-red-400"
                            : "text-ink-400 dark:text-ink-400"
                        }`}
                      >
                        <span>·</span>
                        Workspace name should be less than 40 characters
                      </li>
                      <li
                        className={`flex items-center gap-1 ${
                          workspaceName.length > 0 && !hasNoInvalidChars
                            ? "text-red-500 dark:text-red-400"
                            : "text-ink-400 dark:text-ink-400"
                        }`}
                      >
                        <span>·</span>
                        Cannot contain punctuation/special marks (apostrophes
                        are fine)
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isNameValid}
                    className={`w-full py-3.5 px-4 bg-primary hover:bg-primary-720 disabled:bg-disabled dark:disabled:bg-[#4a4a48] text-border-secondary font-medium rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-transparent ${tintPillDarkClassName}`}
                  >
                    {loading ? (
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
                        Creating...
                      </>
                    ) : (
                      "Create Team"
                    )}
                  </button>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
