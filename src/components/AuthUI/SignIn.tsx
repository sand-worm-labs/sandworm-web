"use client";

import Link from "next/link";

import SignInForm from "./SignInForm";
import SocialLogin from "./SocialLogin";
import ConnectWallet from "./ConnectWallet";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg bg-[#ffffff10] p-6">
        <h2 className="text-2xl font-bold text-center text-white">Sign In</h2>

        <SignInForm />
        <SocialLogin />
        <ConnectWallet />

        <p className="mt-4 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-orange-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
