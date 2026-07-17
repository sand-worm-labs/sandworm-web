import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useState, Fragment } from "react";

import { CloseIconButton } from "@/components/CloseIconButton";

import { WorkspaceIcon } from "./WorkspaceIcon";

// =====================================
// ⬢ Constants
// =====================================
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

// =====================================
// ⬢ Edit Workspace Profile Modal
// =====================================
export default function EditWorkspaceProfileModal({
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
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/[10.2%]" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto font-body">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative bg-white dark:bg-base-400 dark:border dark:border-border-tertiary rounded-3xl w-full max-w-md  mx-4 p-6 py-10 px-10">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h2"
                    className="text-base font-medium text-ink-100 dark:text-white"
                  >
                    Edit workspace Profile
                  </Dialog.Title>
                  <CloseIconButton onClick={onClose} />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-ink-100 mb-3">
                    Workspace Icon
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-full border-2 border-border dark:border-border-tertiary flex items-center justify-center overflow-hidden mr-4">
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
                  <label className="block text-sm font-medium text-ink-100 dark:text-gray-300 mb-3">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={e => setWorkspaceName(e.target.value)}
                    placeholder="Enter workspace name"
                    className="w-full px-4 py-3 rounded-xl bg-inputBg dark:bg-base-100 border border-border dark:border-border-tertiary text-ink-100 placeholder:text-ink-400 dark:placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium"
                  />
                  <ul className="mt-2 space-y-1 text-xs font-medium">
                    <li className="flex items-center gap-1">
                      <span className="text-ink-400 dark:text-ink-400">
                        ·
                      </span>
                      Workspace name should be less than 40 characters
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-ink-400 dark:text-ink-400">
                        ·
                      </span>
                      Cannot contain punctuation/special marks
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isNameValid || isLoading}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary-720 disabled:bg-disabled dark:disabled:bg-[#4a4a48] text-border-secondary font-medium rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
