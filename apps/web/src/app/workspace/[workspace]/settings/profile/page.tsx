"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { useSession } from "@/components/Visualization/hooks/useAuth";
import { useCurrentUser } from "@/components/Visualization/hooks/useCurrentUser";

export default function ProfileSettings() {
  const session = useSession({ redirectToLogin: true });
  const { updateUser, updateUserSettings, loading, error, settings } =
    useCurrentUser();

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    github: "",
    discord: "",
    telegram: "",
    firstName: "",
    lastName: "",
  });

  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Populate form with session + settings data when available
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        firstName: session.user?.firstName || "",
        lastName: session.user?.lastName || "",
        username: session.user?.username || "",
        bio: settings?.statusText || "",
        github: settings?.socialLinks?.github || "",
        discord: settings?.socialLinks?.discord || "",
        telegram: settings?.socialLinks?.telegram || "",
      }));
    }
  }, [
    session?.user?.firstName,
    session?.user?.lastName,
    session?.user?.username,
    settings?.statusText,
    settings?.socialLinks?.github,
    settings?.socialLinks?.discord,
    settings?.socialLinks?.telegram,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (updateSuccess) setUpdateSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateSuccess(false);

    try {
      // Update User (username, firstName, lastName)
      await updateUser({
        username: formData.username || undefined,
        /*   firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined, */
      });

      // Update UserSettings (bio/statusText + socialLinks)
      await updateUserSettings({
        statusText: formData.bio || undefined,
        socialLinks: {
          github: formData.github || null,
          discord: formData.discord || null,
          telegram: formData.telegram || null,
        },
      });

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (!session) return null;

  return (
    <div className="max-w-5xl">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white">
          Public Profile
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 flex gap-8 flex-col-reverse md:flex-row"
      >
        <div className="flex-1 space-y-6">
          {/* Success/Error Messages */}
          {updateSuccess && (
            <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                Profile updated successfully!
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                Failed to update profile. Please try again.
              </p>
            </div>
          )}

          {/* === Account Information Section === */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Account Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ">
                Email
              </label>
              <input
                type="email"
                value={session.user?.email || ""}
                disabled
                className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4] cursor-not-allowed max-w-[30rem]"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                Email cannot be changed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[30rem]">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name"
                  className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4]"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name"
                  className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4]"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4] max-w-[30rem]"
                value={formData.username}
                onChange={handleChange}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                Your public name on Sandworm. It'll appear on your profile,
                shared queries, and contributions across the platform.
              </span>
            </div>
          </div>

          {/* === Profile Details Section === */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Profile Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-1.5  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4] max-w-[30rem] min-h-[6rem] resize-none"
                value={formData.bio}
                onChange={handleChange}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                Optional but helpful. Share a bit about yourself, your
                interests, focus areas, or what you're exploring on-chain.
              </span>
            </div>
          </div>

          {/* === Social Accounts Section === */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Social Accounts
            </h3>

            <div className="space-y-3 max-w-[30rem]">
              <input
                type="text"
                name="github"
                placeholder="GitHub Profile"
                className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4]"
                value={formData.github}
                onChange={handleChange}
              />
              <input
                type="text"
                name="discord"
                placeholder="Discord Username"
                className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4]"
                value={formData.discord}
                onChange={handleChange}
              />
              <input
                type="text"
                name="telegram"
                placeholder="Telegram Handle"
                className="w-full px-3 py-1  rounded-md dark:bg-[#1A1A1A] border dark:border-[#262A30] border-[#DEE2E6] dark:text-white placeholder:dark:text-[#868E96] placeholder-[#455768] focus:outline-none  focus:border-[#C7665C] transition text-xs md:text-sm bg-[#F1F3F4]"
                value={formData.telegram}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* === Action Buttons === */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#C7665C] text-white rounded-xl hover:bg-[#B55A50] text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>

            {session.user?.username && (
              <Link
                href={`/@${session.user.username}`}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2.5 px-5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                View Public Profile
              </Link>
            )}
          </div>
        </div>

        {/* === Avatar Section (unchanged) === */}
        <div className="flex flex-col items-center md:items-start relative">
          <div className="relative">
            {session.user?.avater ? (
              <Image
                src={session.user.avater}
                width={160}
                height={160}
                alt={
                  session.user.fullName ||
                  session.user.username ||
                  "User avatar"
                }
                className="rounded-full border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-40 h-40 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#363C46] flex items-center justify-center">
                <span className="text-4xl font-medium text-gray-400 dark:text-gray-500">
                  {(
                    session.user?.firstName?.[0] ||
                    session.user?.username?.[0] ||
                    "?"
                  ).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            disabled
            className="mt-4 text-xs font-medium text-gray-400 dark:text-[#8696A6] cursor-not-allowed  flex items-center border-[#E6E0F1] border bg-[#F1F3F4] dark:bg-[#121417] px-3 rounded-lg py-1.5 absolute left-[-2.5rem] top-[7.5rem] opacity-50 dark:border-[#262A30]"
          >
            <Pencil className="inline-block mr-2" size={14} />
            Change Avatar
          </button>
        </div>
      </form>
    </div>
  );
}
