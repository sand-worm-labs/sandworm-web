"use client";

import { Fragment } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { useProfileForm } from "@/hooks/useProfileSettings";

import { ProfileCardIcon } from "../Assets/ProfileCardIcon";

interface SessionUser {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avater?: string;
  fullName?: string;
}

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SessionUser | null | undefined;
  updateProfile: (params: {
    user?: { username?: string; firstName?: string; lastName?: string };
    socialLinks?: {
      github?: string | null;
      discord?: string | null;
      telegram?: string | null;
    };
    statusText?: string;
  }) => Promise<void>;
  loading: boolean;
  error: unknown;
}

// =====================================
// ⬢ Constants
// =====================================
const inputClassName =
  "w-full px-3 md:py-2.5 py-1.5 rounded-xl bg-white dark:bg-base-400 border border-[#DEE2E6] dark:border-border-tertiary text-[#868E96] dark:text-white placeholder:text-ink-400 dark:placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-[#A308F0]/50 focus:border-[#A308F0] transition md:text-sm text-[13px] ";

const labelClassName =
  "block text-xs font-bold text-[#6C757D] dark:text-gray-300 mb-2 uppercase font-bold";

// =====================================
// ⬢ Profile Settings Modal
// =====================================
export function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  updateProfile,
  loading,
  error,
}: ProfileSettingsModalProps) {
  const {
    formData,
    handleChange,
    handleSubmit,
    resetForm,
    updateSuccess,
    submitError,
    isSubmitting,
  } = useProfileForm({
    user,
    updateProfile,
    loading,
    onSuccess: () => {},
  });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0000001A]" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto font-body">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-[32px] bg-white dark:bg-base-100 dark:border dark:border-border-tertiary transition-all pt-5">
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center justify-between md:px-10 px-5 py-6">
                    <div className="flex justify-between w-full">
                      <div>
                        <ProfileCardIcon />
                        <DialogTitle
                          as="h2"
                          className="text-base font-semibold text-ink-100 dark:text-white mt-3"
                        >
                          Edit Profile
                        </DialogTitle>
                        <p className="text-[#6C757D] dark:text-ink-400 text-sm mt-1.5">
                          Change details relating to how other users see your
                          account
                        </p>
                      </div>

                      <div className="flex flex-col items-center md:items-start shrink-0">
                        <div className="relative group">
                          <button
                            type="button"
                            disabled
                            className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-ink-400 dark:text-ink-400 border-none dark:border-border-tertiary rounded-lg dark:bg-base-100 cursor-not-allowed opacity-50 absolute top-[50%] translate-y-[-70%]"
                          >
                            Click to Change Image
                          </button>
                          {user?.avater ? (
                            <Image
                              src={user.avater}
                              width={60}
                              height={60}
                              alt={
                                user.fullName || user.username || "User avatar"
                              }
                              className="rounded-full border-2 border-border-secondary dark:border-border-tertiary"
                            />
                          ) : (
                            <div className="w-[88px] h-[88px] rounded-full border-2 border-border-secondary dark:border-border-tertiary bg-gray-100 dark:bg-base-400 flex items-center justify-center">
                              <Image
                                src="/img/avatar/avatar6.svg"
                                alt=""
                                fill
                                className="object-cover"
                              />
                              <span className="text-4xl relative z-10 font-medium text-white">
                                {(
                                  user?.firstName?.[0] ||
                                  user?.username?.[0] ||
                                  "?"
                                ).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:px-10 px-5 py-6 max-h-[70vh] overflow-y-auto">
                    {updateSuccess && (
                      <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Profile updated successfully!
                        </p>
                      </div>
                    )}

                    {(error || submitError) && (
                      <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {submitError ||
                            "Failed to update profile. Please try again."}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col-reverse md:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                        <section className="space-y-4">
                          <div>
                            <label className={labelClassName}>Email</label>
                            <input
                              type="email"
                              value={user?.email || ""}
                              disabled
                              className={`${inputClassName} bg-gray-50 dark:bg-[#0D0F11] cursor-not-allowed opacity-60`}
                            />
                            <p className="text-xs text-ink-400  dark:text-ink-400 mt-1">
                              Email cannot be changed
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelClassName}>
                                First Name
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                placeholder="First name"
                                className={inputClassName}
                                value={formData.firstName}
                                onChange={handleChange}
                              />
                            </div>
                            <div>
                              <label className={labelClassName}>
                                Last Name
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                placeholder="Last name"
                                className={inputClassName}
                                value={formData.lastName}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          <div>
                            <label className={labelClassName}>Username</label>
                            <input
                              type="text"
                              name="username"
                              placeholder="Username"
                              className={inputClassName}
                              value={formData.username}
                              onChange={handleChange}
                            />
                            <p className="text-xs text-ink-400  dark:text-ink-400 mt-1">
                              Your public name on Sandworm
                            </p>
                          </div>
                        </section>

                        <section className="space-y-4">
                          <div>
                            <label className={labelClassName}>Bio</label>
                            <textarea
                              name="bio"
                              placeholder="Tell us about yourself..."
                              rows={3}
                              className={`${inputClassName} resize-none`}
                              value={formData.bio}
                              onChange={handleChange}
                            />
                          </div>
                        </section>

                        <section className="space-y-4 pt-4 dark:border-gray-700">
                          <h3 className="text-xs font-bold text-ink-100 dark:text-white">
                            Social Media
                          </h3>
                          <div className="gap-4 grid grid-cols-2">
                            <div>
                              <label className={labelClassName}>github</label>
                              <input
                                type="text"
                                name="github"
                                placeholder="GitHub Profile URL"
                                className={inputClassName}
                                value={formData.github}
                                onChange={handleChange}
                              />
                            </div>
                            <div>
                              <label className={labelClassName}>discord</label>
                              <input
                                type="text"
                                name="discord"
                                placeholder="Discord Username"
                                className={inputClassName}
                                value={formData.discord}
                                onChange={handleChange}
                              />
                            </div>
                            <div>
                              <label className={labelClassName}>telegram</label>
                              <input
                                type="text"
                                name="telegram"
                                placeholder="Telegram Handle"
                                className={inputClassName}
                                value={formData.telegram}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 px-6 py-4 pt-3 ">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-2 text-sm font-medium text-white bg-[#0F0F0F] dark:bg-white dark:text-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-ink-100 dark:hover:text-white bg-[#F8F9FA] dark:bg-transparent border border-[#DEE2E6] rounded-xl hover:bg-gray-50 transition-colors dark:border-border-tertiary"
                    >
                      Cancel
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
