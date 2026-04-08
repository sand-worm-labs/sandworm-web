"use client";

import React, { useState, useCallback } from "react";
import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import {
  XMarkIcon,
  LinkIcon,
  CheckIcon,
  LockClosedIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@sandworm/ui/lib/utils";

import { Share } from "@/components/Assets/Share";

type ShareVisibility = "private" | "team" | "community";

type ShareModalProps = {
  link?: string;
  initialVisibility?: ShareVisibility;
  onVisibilityChange?: (visibility: ShareVisibility) => Promise<void> | void;
};

const visibilityOptions = [
  {
    id: "private" as const,
    name: "Private",
    description: "Only you have access",
    icon: LockClosedIcon,
  },
  {
    id: "team" as const,
    name: "Team",
    description: "Workspace members can collaborate",
    icon: UserGroupIcon,
  },
  {
    id: "community" as const,
    name: "Publish to Community",
    description: "Anyone can view and fork",
    icon: GlobeAltIcon,
  },
];

export default function ShareModal({
  link = "https://app.sandworm.dev/notebooks/demo",
  initialVisibility = "private",
  onVisibilityChange,
}: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] =
    useState<ShareVisibility>(initialVisibility);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [link]);

  const handleVisibilityChange = useCallback(
    async (newVisibility: ShareVisibility) => {
      setVisibility(newVisibility);

      if (onVisibilityChange) {
        setIsUpdating(true);
        try {
          await onVisibilityChange(newVisibility);
        } catch (error) {
          setVisibility(visibility);
          console.error("Failed to update visibility:", error);
        } finally {
          setIsUpdating(false);
        }
      }
    },
    [onVisibilityChange, visibility]
  );

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={openModal}
        className={cn(
          "p-2 mb-2 rounded-lg transition-colors flex items-center justify-center",
          "text-ink-400 hover:text-ink-100 dark:text-ink-100 dark:hover:text-white",
          "hover:bg-[#F1F3F4] dark:hover:bg-base-400 "
        )}
        aria-label="Share"
        title="Share"
      >
        <Share size={22} />
      </button>

      {/* Modal */}
      <Transition show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
          {/* Backdrop */}
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          {/* Modal container */}
          <div className="fixed inset-0 overflow-y-auto font-body">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white dark:bg-base-400  shadow-xl transition-all px-3 py-4">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-1">
                    <div>
                      <Dialog.Title className="text-lg font-medium text-ink-100 dark:text-white">
                        Share document
                      </Dialog.Title>
                      <p className="text-sm text-ink-300 dark:text-ink-400 mt-0.5">
                        Choose who can access this notebook
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-lg p-1.5 text-ink-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-base-500 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Visibility Options */}
                  <div className="px-5 py-4">
                    <RadioGroup
                      value={visibility}
                      onChange={handleVisibilityChange}
                      className="space-y-2"
                    >
                      {visibilityOptions.map(option => (
                        <RadioGroup.Option
                          key={option.id}
                          value={option.id}
                          disabled={isUpdating}
                          className={({ checked }) =>
                            cn(
                              "relative flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all",
                              checked
                                ? "border-none bg-primary-50 dark:bg-primary-500/10 ring-1 ring-primary"
                                : "border-border-secondary  hover:border-gray-300 dark:hover:border-border-secondary hover:bg-gray-50 dark:hover:bg-base-500",
                              isUpdating && "opacity-50 cursor-not-allowed"
                            )
                          }
                        >
                          {({ checked }) => (
                            <>
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                  checked
                                    ? "bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400"
                                    : "bg-gray-100 dark:bg-base-500 text-ink-400  dark:text-ink-400"
                                )}
                              >
                                <option.icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <RadioGroup.Label
                                  as="p"
                                  className={cn(
                                    "text-sm font-medium",
                                    checked
                                      ? "text-primary-900 dark:text-primary-300"
                                      : "text-ink-100 "
                                  )}
                                >
                                  {option.name}
                                </RadioGroup.Label>
                                <RadioGroup.Description
                                  as="p"
                                  className={cn(
                                    "text-sm",
                                    checked
                                      ? "text-primary-700 dark:text-primary-400"
                                      : "text-ink-400  dark:text-ink-400"
                                  )}
                                >
                                  {option.description}
                                </RadioGroup.Description>
                              </div>
                              {checked && (
                                <CheckIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0" />
                              )}
                            </>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Copy Link Section */}
                  <div className="px-5 pb-5">
                    <div className="flex items-center gap-2 rounded-lg border border-border-secondary  bg-gray-50 dark:bg-base-100 p-1.5 pl-3">
                      <input
                        type="text"
                        readOnly
                        value={link}
                        className="flex-1 min-w-0 bg-transparent text-sm text-ink-400 dark:text-ink-400 outline-none truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopy}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                          copied
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-white dark:bg-base-100 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-base-500 border border-border-secondary ]"
                        )}
                      >
                        {copied ? (
                          <>
                            <CheckIcon className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-4 w-4" />
                            Copy link
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
