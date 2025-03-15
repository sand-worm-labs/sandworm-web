"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithEmail } from "@/services/auth";

export default function SignInForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const isOk = await signInWithEmail(formData.email, formData.password);
    if (isOk) router.push("/workspace");
    if (!isOk) {
      setError("Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">Email</label>
        <input
          type="email"
          name="email"
          className="mt-1 w-full rounded-md bg-[#1A1A1A] p-2 text-white focus:border-orange-500 focus:ring-orange-500"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          type="password"
          name="password"
          className="mt-1 w-full rounded-md bg-[#1A1A1A] p-2 text-white focus:border-orange-500 focus:ring-orange-500"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-orange-600 px-4 py-2 text-white font-medium disabled:bg-orange-300"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
