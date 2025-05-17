"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { DicebearAvatar } from "@/components/DicebearAvatar";

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    username: "ceeriil",
    bio: "",
    github: "",
    discord: "",
    telegram: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const { data: session } = useSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (!session) {
    return null;
  }

  return (
    <div>
      <div className="border-b">
        <h2 className="text-xl font-medium text-white mb-2 ">Public Profile</h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4 flex space-x-6">
        <div className="flex flex-col space-y-4 items-start">
          <div>
            <label className="mb-1 inline-block font-medium">Name</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full rounded-md bg-dark-gray p-2 text-white text-sm max-w-[30rem] block"
              value={formData.username}
              onChange={handleChange}
            />
            <span className="text-xs text-text-gray mt-1">
              Your public name on Sandworm. It’ll appear on your profile, shared
              queries, and contributions across the platform.
            </span>
          </div>

          <div>
            <label className="mb-1 inline-block font-medium">Bio</label>
            <textarea
              name="bio"
              placeholder="Bio"
              className="w-full rounded-md bg-dark-gray p-2 text-white text-sm min-h-[6rem] max-w-[30rem] block placeholder:text-text-gray "
              value={formData.bio}
              onChange={handleChange}
            />
            <span className="text-xs text-text-gray">
              Optional but helpful. Share a bit about yourself, your interests,
              focus areas, or what you’re exploring on-chain.
            </span>
          </div>

          <div className="w-full">
            <label className="mb-2 inline-block font-medium">
              Social Accounts
            </label>
            <input
              type="text"
              name="github"
              placeholder="GitHub Profile"
              className="w-full rounded-md bg-dark-gray p-2 text-white text-xs mb-3 placeholder:text-text-gray max-w-[30rem] block"
              value={formData.github}
              onChange={handleChange}
            />
            <input
              type="text"
              name="discord"
              placeholder="Discord Username"
              className="w-full rounded-md bg-dark-gray p-2 text-white text-xs mb-3 placeholder:text-text-gray max-w-[30rem] block"
              value={formData.discord}
              onChange={handleChange}
            />
            <input
              type="text"
              name="telegram"
              placeholder="Telegram Handle"
              className="w-full rounded-md bg-dark-gray p-2 text-white text-xs mb-3 placeholder:text-text-gray max-w-[30rem] block"
              value={formData.telegram}
              onChange={handleChange}
            />
          </div>

          <button className="text-sm " type="button">
            Update Profile
          </button>
        </div>

        <div>
          {session?.user?.image ? (
            <Image
              src={session?.user.image}
              width={300}
              height={300}
              alt={`${session?.user.name} image`}
              className="rounded-full border"
            />
          ) : (
            <DicebearAvatar
              size={300}
              seed={session?.user?.name || "sandworm"}
            />
          )}
        </div>
      </form>
    </div>
  );
}
