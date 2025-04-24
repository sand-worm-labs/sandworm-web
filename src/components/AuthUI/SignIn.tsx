"use client";

import Link from "next/link";

import { SandwormLogo } from "../Assets/SandwormLogo";

import { SignInForm } from "./SignInForm";
import { SocialLogin } from "./SocialLogin";
import { ConnectWallet } from "./ConnectWallet";

export const SignIn = () => {
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
        <h2 className="text-2xl font-bold text-center text-white">Sign In</h2>

        <SignInForm />
        <SocialLogin />
        <ConnectWallet />

        <p className="mt-4 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-orange-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
