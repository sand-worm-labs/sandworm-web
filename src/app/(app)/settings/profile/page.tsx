"use client";

import { useState } from "react";

import { DicebearAvatar } from "@/components/DicebearAvatar";

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    username: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="border border-borderLight px-6 py-8 rounded-md mt-12 ">
      <h2 className="text-xl font-medium text-white uppercase">
        Profile Settings
      </h2>

      {/* Profile Picture */}
      <div className="mt-10 flex justify-between items-center">
        <DicebearAvatar seed="profile" />
        <button
          type="submit"
          className=" bg-orange-600 py-2 px-5 text-sm font-medium rounded-md text-white"
        >
          Save Changes
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full rounded-md bg-dark-gray p-2 text-white"
          value={formData.username}
          onChange={handleChange}
        />
        <textarea
          name="bio"
          placeholder="Bio"
          className="w-full rounded-md bg-dark-gray p-2 text-white"
          value={formData.bio}
          onChange={handleChange}
        />
        <input
          type="text"
          name="github"
          placeholder="GitHub Profile"
          className="w-full rounded-md bg-dark-gray p-2 text-white"
          value={formData.github}
          onChange={handleChange}
        />
        <input
          type="text"
          name="discord"
          placeholder="Discord Username"
          className="w-full rounded-md bg-dark-gray p-2 text-white"
          value={formData.discord}
          onChange={handleChange}
        />
        <input
          type="text"
          name="telegram"
          placeholder="Telegram Handle"
          className="w-full rounded-md bg-dark-gray p-2 text-white"
          value={formData.telegram}
          onChange={handleChange}
        />
      </form>
    </div>
  );
}
