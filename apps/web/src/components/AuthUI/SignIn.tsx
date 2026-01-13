"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SocialLogin } from "./SocialLogin";
import { SignInForm } from "./SignInForm";
import { SandwormLogo } from "../Assets";
import { PartnersSection } from "../Partners";

export const SignIn = () => {
  const params = useSearchParams();
  const error = params?.get("error");
  return (
    <div className="w-full max-w-md rounded-lg  p-6 content flex flex-col justify-center items-center h-full mx-auto relative">
      <SandwormLogo width="40" height="40" />

      <h2 className="text-3xl font-medium text-center text-black mb-1 mt-3 font-primary dark:text-white">
        Welcome back
      </h2>

      <p className="text-[#455768] font-primary text-sm mt-1 mb-6">
        Sign into Sandworm
      </p>

      {error === "NoAccount" && (
        <div className="w-full text-sm font-primary bg-red-50 text-red-700 border border-red-200 rounded-md p-3 mb-3">
          No account found. Please sign up first.
        </div>
      )}

      <SocialLogin variant="signin" />

      <div className="flex items-center gap-3 w-full my-2.5">
        <div className="h-px bg-[#E9ECEF] dark:bg-[#FFFFFF30] flex-1" />
        <span className="text-xs text-muted-foreground font-primary">or</span>
        <div className="h-px bg-[#E9ECEF] dark:bg-[#FFFFFF30] flex-1" />
      </div>

      <SignInForm />

      <div className="flex justify-between w-full text-sm font-primary mt-4">
        <p className="text-muted-foreground">
          Need an account?{" "}
          <Link href="/signup" className="text-[#8053FE] hover:underline">
            Sign Up
          </Link>
        </p>
        <Link href="/reset" className="text-[#FF0000] hover:underline">
          Forgot Password
        </Link>
      </div>

      <div className="flex-col  gap-2 absolute bottom-[4rem] w-full flex items-center justify-center">
        <p className="text-base text-[#455768] font-primary mb-4">
          Trusted by teams at
        </p>
        <PartnersSection />
      </div>
    </div>
  );
};
