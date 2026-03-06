"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { useCreateWorkspaceMutation } from "@/generated/graphql";

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (workspaceId: string) => void;
}

export default function CreateTeamModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTeamModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    source: "",
    useCases: "",
    useContext: "",
  });

  const [createWorkspace, { loading }] = useCreateWorkspaceMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    try {
      const result = await createWorkspace({
        variables: {
          name: formData.name.trim(),
        },
      });

      if (result.data?.createWorkspace) {
        onSuccess?.(result.data.createWorkspace.id);
        setFormData({ name: "", source: "", useCases: "", useContext: "" });
        onClose();
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", source: "", useCases: "", useContext: "" });
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0000001A]" />
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
              <Dialog.Panel className="w-full max-w-[31rem] transform overflow-hidden rounded-3xl bg-white  dark:bg-base-400 transition-all dark:border-border-tertiary dark:border ">
                <div className="flex items-center justify-between  px-6 py-4">
                  <Dialog.Title className="text-base font-medium text-ink-100 dark:text-white">
                    Create New Team
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="rounded-lg p-1 text-ink-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label
                      htmlFor="team-name"
                      className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-1.5"
                    >
                      Team Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="team-name"
                      type="text"
                      required
                      placeholder="e.g., Defi Team"
                      value={formData.name}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                      }
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-[#F8F9FA] dark:bg-[#262626] border border-[#DEE2E6] dark:border-[#363636] text-ink-100 dark:text-white placeholder:text-[#6C757D] dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A308F0] focus:border-transparent transition-all text-sm font-medium"
                    />
                  </div>

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

                  <div className="flex items-center gap-3 pt-4 ">
                    <button
                      type="submit"
                      disabled={loading || !formData.name.trim()}
                      className="w-full py-3.5 px-4 bg-[#A308F0] hover:bg-[#8a07c9] disabled:bg-[#868E96] text-[#E9ECEF] font-medium rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
