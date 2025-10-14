"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Icons } from "../icons";

import { SocialLogin } from "./SocialLogin";

export const SignIn = () => {
  const params = useSearchParams();
  const error = params?.get("error");
  return (
    <div className="w-full max-w-md rounded-lg border border-[#ffffff30] p-6 content flex flex-col justify-center items-center h-full mx-auto">
      <Icons.DarkLogo />

      <h2 className="text-3xl font-medium text-center text-black mb-6 mt-4 roobert">
        Welcome back to <span className="uppercase font-bold">SANDWORM</span>!
      </h2>

      {error === "NoAccount" && (
        <div className="w-full text-sm roobert bg-red-50 text-red-700 border border-red-200 rounded-md p-3 mb-3">
          No account found. Please sign up first.
        </div>
      )}

      <SocialLogin variant="signin" />

      <div className="flex items-center gap-3 w-full my-4">
        <div className="h-px bg-[#E9ECEF] flex-1" />
        <span className="text-xs text-muted-foreground roobert">or</span>
        <div className="h-px bg-[#E9ECEF] flex-1" />
      </div>

      <div className="flex justify-between w-full text-sm roobert">
        <p className="text-muted-foreground">
          Need an account?{" "}
          <Link href="/signup" className="text-[#8053FE] hover:underline">
            Sign Up
          </Link>
        </p>
        <Link href="#" className="text-red-500 hover:underline">
          Forgot Password
        </Link>
      </div>
    </div>
  );
};
