"use client";

import React, { useState, useCallback, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceName: string;
  onInvite: (email: string, role?: string) => Promise<void>;
}

export default function InviteUserModal({
  isOpen,
  onClose,
  workspaceName,
  onInvite,
}: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setEmail("");
      setRole("member");
      setError("");
      onClose();
    }
  }, [isSubmitting, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email.trim()) {
        setError("Email is required");
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      setIsSubmitting(true);
      setError("");

      try {
        await onInvite(email, role);
        setEmail("");
        setRole("member");
        onClose();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send invitation"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, role, onInvite, onClose]
  );

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
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto font-primary">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#0C1015] p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    Invite member to {workspaceName}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="rounded-lg p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Invite by email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
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
                        className="w-full pl-10 pr-16 py-1.5 rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none focus:ring focus:ring-[#A308F0] transition text-xs md:text-sm bg-[#F1F3F4]"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-1.5 rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white focus:outline-none focus:ring focus:ring-[#A308F0] transition text-xs md:text-sm bg-[#F1F3F4]"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {error && (
                    <p className="mb-4 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#181C21] hover:bg-gray-200 dark:hover:bg-[#181C21] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#A308F0] hover:bg-[#B55A50] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Sending..." : "Invite"}
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
