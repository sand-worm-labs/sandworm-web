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
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto font-primary">
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-xl transition-all lg:min-w-[37rem]">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                    Create New Team
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Team Name */}
                  <div>
                    <label
                      htmlFor="team-name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
                      className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#A308F0] transition text-xs md:text-sm bg-[#F1F3F4]"
                    />
                  </div>

                  {/* Source - How was it created */}
                  <div>
                    <label
                      htmlFor="source"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Origin
                    </label>
                    <input
                      id="source"
                      type="text"
                      placeholder="How was this team created?"
                      value={formData.source}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          source: e.target.value,
                        }))
                      }
                      disabled={loading}
                      className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#A308F0] transition text-xs md:text-sm bg-[#F1F3F4]"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Optional: How or why this team was formed
                    </p>
                  </div>

                  {/* Use Cases - What will you do */}
                  <div>
                    <label
                      htmlFor="use-cases"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Intent
                    </label>
                    <textarea
                      id="use-cases"
                      rows={3}
                      placeholder="What will you do with this team?"
                      value={formData.useCases}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          useCases: e.target.value,
                        }))
                      }
                      disabled={loading}
                      className="w-full px-3 py-1.5  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#A308F0] transition text-xs md:text-sm bg-[#F1F3F4] min-h-[6rem] resize-none "
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Optional: Primary goals and use cases
                    </p>
                  </div>

                  {/* Use Context - In what setting */}
                  <div>
                    <label
                      htmlFor="use-context"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      Situation
                    </label>
                    <input
                      id="use-context"
                      type="text"
                      placeholder="In what setting are you using it?"
                      value={formData.useContext}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          useContext: e.target.value,
                        }))
                      }
                      disabled={loading}
                      className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#A308F0] transition text-xs md:text-sm bg-[#F1F3F4] "
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Optional: Context of where/how it will be used
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 ">
                    <button
                      type="submit"
                      disabled={loading || !formData.name.trim()}
                      className="px-4 py-3 text-sm font-medium text-white bg-[#A308F0] hover:bg-[#A308F0] dark:bg-[#A308F0] dark:hover:bg-[#A308F0] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full text-center justify-center"
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
