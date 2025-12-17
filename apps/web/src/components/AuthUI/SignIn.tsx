"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SandwormDarkLogo } from "../Assets/SandwormDarkLogo";

import { SocialLogin } from "./SocialLogin";
import { SignInForm } from "./SignInForm";

export const SignIn = () => {
  const params = useSearchParams();
  const error = params?.get("error");
  return (
    <div className="w-full max-w-md rounded-lg  p-6 content flex flex-col justify-center items-center h-full mx-auto">
      <SandwormDarkLogo />

      <h2 className="text-3xl font-medium text-center text-black mb-6 mt-4 font-primary dark:text-white">
        Welcome back to <span className="uppercase font-bold">SANDWORM</span>!
      </h2>

      {error === "NoAccount" && (
        <div className="w-full text-sm font-primary bg-red-50 text-red-700 border border-red-200 rounded-md p-3 mb-3">
          No account found. Please sign up first.
        </div>
      )}

      <SignInForm />

      <div className="flex items-center gap-3 w-full my-4">
        <div className="h-px bg-[#E9ECEF] dark:bg-[#FFFFFF30] flex-1" />
        <span className="text-xs text-muted-foreground roobert">or</span>
        <div className="h-px bg-[#E9ECEF] dark:bg-[#FFFFFF30] flex-1" />
      </div>

      <SocialLogin variant="signin" />

      <div className="flex justify-between w-full text-sm font-primary mt-4">
        <p className="text-muted-foreground">
          Need an account?{" "}
          <Link href="/signup" className="text-[#8053FE] hover:underline">
            Sign Up
          </Link>
        </p>
        <Link href="/" className="text-[#FF0000] hover:underline">
          Forgot Password
        </Link>
      </div>
    </div>
  );
};
