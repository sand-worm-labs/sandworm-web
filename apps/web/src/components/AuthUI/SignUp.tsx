"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PartnersSection } from "../Partners";
import { SandwormLogo } from "../Assets";

import { SocialLogin } from "./SocialLogin";
import SignUpForm from "./SignUpForm";

export const SignUp = () => {
  const searchParams = useSearchParams();
  const isUsernameStep = searchParams.get("step") === "3";

  return (
    <div className="w-full max-w-md rounded-lg p-6 content flex flex-col justify-center items-center h-full mx-auto text-black dark:text-white">
      {!isUsernameStep && (
        <>
          <SandwormLogo width="40" height="40" />

          <h2 className="text-3xl font-medium text-center text-black mb-1 mt-3 font-primary dark:text-white">
            Welcome to Sandworm
          </h2>

          <p className="text-ink-200 font-body font-medium text-sm mt-1 mb-6">
            Sign up in 3 steps
          </p>

          <SocialLogin variant="signin" />

          <div className="flex items-center gap-3 w-full my-2.5">
            <div className="h-px bg-[#E9ECEF] dark:bg-[#FFFFFF30] flex-1" />
            <span className="text-xs text-muted-foreground font-primary">
              or
            </span>
            <div className="h-px bg-[#E9ECEF] dark:bg-[#FFFFFF30] flex-1" />
          </div>
        </>
      )}

      <SignUpForm />

      {!isUsernameStep && (
        <p className="text-center text-ink-500 dark:text-ink-400 font-primary text-sm mt-4">
          Have an account?
          <Link href="/signin" className="text-accent hover:underline ml-1">
            Sign In
          </Link>
        </p>
      )}

      <div className="flex-col gap-2 absolute bottom-[3rem] w-full flex items-center justify-center">
        {!isUsernameStep && (
          <>
            <p className="text-base text-ink-200 font-body font-medium mb-2.5">
              Trusted by teams at
            </p>
            <PartnersSection />
          </>
        )}
      </div>
    </div>
  );
};
