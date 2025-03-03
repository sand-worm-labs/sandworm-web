"use client";

import { useState } from "react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-orange-500 focus:ring-orange-500"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          type="password"
          className="mt-1 w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white focus:border-orange-500 focus:ring-orange-500"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled
        className="w-full rounded-md bg-orange-500 px-4 py-2 text-white font-medium disabled:bg-orange-300"
      >
        Sign In
      </button>
    </form>
  );
}
