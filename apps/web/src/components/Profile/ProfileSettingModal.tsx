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
import { X, Pencil } from "lucide-react";

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

interface UserSettings {
  statusText?: string;
  socialLinks?: {
    github?: string | null;
    discord?: string | null;
    telegram?: string | null;
  };
}

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SessionUser | null | undefined;
  settings: UserSettings | null | undefined;
  updateUser: (data: Partial<{ username?: string }>) => Promise<void>;
  updateUserSettings: (data: {
    statusText?: string;
    socialLinks?: {
      github?: string | null;
      discord?: string | null;
      telegram?: string | null;
    };
  }) => Promise<void>;
  loading: boolean;
  error: unknown;
}

const inputClassName =
  "w-full px-3 py-3.5 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#DEE2E6] dark:border-[#262A30] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A308F0]/50 focus:border-[#A308F0] transition text-sm";

const labelClassName =
  "block text-sm font-medium text-[#6C757D] dark:text-gray-300 mb-2 uppercase font-bold ";

export function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  settings,
  updateUser,
  updateUserSettings,
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
    settings,
    updateUser,
    updateUserSettings,
    loading,
    onSuccess: () => {
      // todo
    },
  });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal container */}
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
              <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-[32px] bg-white dark:bg-[#121417]  transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-10 py-6">
                  <div>
                    <ProfileCardIcon />

                    <DialogTitle
                      as="h2"
                      className="text-base font-semibold text-gray-900 dark:text-white mt-3"
                    >
                      Edit Profile
                    </DialogTitle>
                    <p className="text-[#6C757D] text-sm mt-1.5">
                      Change details relating to how other users see your
                      account
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="px-10 py-6 max-h-[70vh] overflow-y-auto">
                    {/* Status Messages */}
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
                      {/* Form Fields */}
                      <div className="flex-1 space-y-6">
                        {/* Account Information */}
                        <section className="space-y-4">
                          <div>
                            <label className={labelClassName}>Email</label>
                            <input
                              type="email"
                              value={user?.email || ""}
                              disabled
                              className={`${inputClassName} bg-gray-50 dark:bg-[#0D0F11] cursor-not-allowed opacity-60`}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Your public name on Sandworm
                            </p>
                          </div>
                        </section>

                        {/* Profile Details */}
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Share a bit about yourself and your focus areas
                            </p>
                          </div>
                        </section>

                        {/* Social Accounts */}
                        <section className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="text-xs font-bold text-ink-100 dark:text-white  tracking-wide">
                            Social Media
                          </h3>

                          <div className="space-y-3">
                            <input
                              type="text"
                              name="github"
                              placeholder="GitHub Profile URL"
                              className={inputClassName}
                              value={formData.github}
                              onChange={handleChange}
                            />
                            <input
                              type="text"
                              name="discord"
                              placeholder="Discord Username"
                              className={inputClassName}
                              value={formData.discord}
                              onChange={handleChange}
                            />
                            <input
                              type="text"
                              name="telegram"
                              placeholder="Telegram Handle"
                              className={inputClassName}
                              value={formData.telegram}
                              onChange={handleChange}
                            />
                          </div>
                        </section>
                      </div>

                      {/* Avatar Section */}
                      <div className="flex flex-col items-center md:items-start shrink-0">
                        <div className="relative group">
                          <button
                            type="button"
                            disabled
                            className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 border-none dark:border-[#262A30] rounded-lg  dark:bg-[#121417] cursor-not-allowed opacity-50"
                          >
                            Click to Change Image
                          </button>
                          {user?.avater ? (
                            <Image
                              src={user.avater}
                              width={120}
                              height={120}
                              alt={
                                user.fullName || user.username || "User avatar"
                              }
                              className="rounded-full border-2 border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-[120px] h-[120px] rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#363C46] flex items-center justify-center">
                              <span className="text-3xl font-medium text-gray-400 dark:text-gray-500">
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

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 px-6 py-4 pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-2 text-sm font-medium text-white bg-[#0F0F0F] rounded-xl  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-[#F8F9FA] dark:bg-transparent border border-[#DEE2E6]  rounded-xl hover:bg-gray-50 transition-colors"
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
