"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { signInWithGoogle } from "@/services/firebase/auth";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignInWithGoogle = async () => {
    const isOk = await signInWithGoogle();
    if (isOk) router.push("/explore");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-[#ffffff10] p-6">
        <h2 className="text-2xl font-bold text-center text-white">Sign In</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
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

        <div className="mt-6 flex space-x-3">
          <button
            type="button"
            onClick={handleSignInWithGoogle}
            className="flex w-1/2 items-center justify-center space-x-2 rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
          >
            <FcGoogle size={20} />
            <span>Google</span>
          </button>

          <button
            disabled
            type="button"
            className="flex w-1/2 items-center justify-center space-x-2 rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
          >
            <FaGithub size={20} />
            <span>GitHub</span>
          </button>
        </div>

        <button
          disabled
          type="button"
          className="mt-4 flex w-full items-center justify-center space-x-2 rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
        >
          <span>Connect Wallet</span>
        </button>

        <p className="mt-4 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/signup" className="text-orange-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
