"use client";

import Link from "next/link";

import { SandwormLogo } from "../Assets/SandwormLogo";

import SignUpForm from "./SignUpForm";

export default function SignUp() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 line-bg relative">
      <Link
        href="/"
        className="flex items-center absolute top-6 left-6 md:left-12 z-10"
      >
        <SandwormLogo />
        <span className="ml-3 font-medium text-xl uppercase">SandWorm.</span>
      </Link>
      <div className="grid-overlay" />

      <div className="w-full max-w-md rounded-lg border border-[#ffffff30] p-6 content">
        <h2 className="text-2xl font-bold text-center text-white">Sign Up</h2>

        <SignUpForm />

        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/sign-up" className="text-orange-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
