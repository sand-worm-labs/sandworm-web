import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { CloseIconButton } from "@/components/CloseIconButton";
import { surfaceHoverClassName } from "@/styles/interactive";

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  workspaceName: string;
  isDeleting: boolean;
}

// =====================================
// ⬢ Delete Workspace Modal
// =====================================
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
          <div className="fixed inset-0 bg-black/[10.2%]" />
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
            <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 py-8 shadow-xl relative dark:bg-dropdown-bg  border dark:border-border-tertiary ">
              <Dialog.Title className="text-lg font-medium text-ink-100">
                Delete Workspace
              </Dialog.Title>

              <CloseIconButton
                onClick={onClose}
                className="absolute top-4 right-4"
              />

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
                  className="rounded-xl bg-error px-6 py-2 text-sm font-medium text-inputBg hover:bg-red-700 dark:bg-[#FF4444] "
                >
                  {isDeleting ? "Deleting Workspace" : "Delete"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`rounded-xl border border-border bg-inputBg dark:bg-dropdown-bg px-6 py-2 text-sm font-medium text-ink-400 dark:text-ink-100 dark:border-border-tertiary ${surfaceHoverClassName}`}
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
