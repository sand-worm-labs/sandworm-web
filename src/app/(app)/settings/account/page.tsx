"use client";

import { useState } from "react";
/* import { changePassword, linkGitHub, unlinkGitHub } from "@/services/auth"; */

export default function AccountSettings() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    /*  const success = await changePassword(password); */
    /*  setMessage(success ? "Password updated!" : "Failed to update password."); */
    setLoading(false);
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold text-white">Account Settings</h2>

      {/* Password Change */}
      <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
        <input
          type="password"
          placeholder="New Password"
          className="w-full rounded-md bg-[#1A1A1A] p-2 text-white"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-orange-600 py-2 rounded-md text-white"
          disabled={loading}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>

      {message && <p className="mt-2 text-green-500">{message}</p>}

      {/* Linked Accounts */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white">Linked Accounts</h3>
        <div className="mt-2">
          <button
            type="button"
            className="w-full bg-gray-700 py-2 rounded-md text-white"
          >
            Link GitHub
          </button>
          <button
            type="button"
            className="w-full bg-red-500 py-2 rounded-md text-white mt-2"
          >
            Unlink GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
