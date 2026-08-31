"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SandwormLogo } from "../Assets";

import { SocialLogin } from "./SocialLogin";
import { SignInForm } from "./SignInForm";

// =====================================
// ⬢ Sign In Main Component
// =====================================
export const SignIn = () => {
  const params = useSearchParams();
  const error = params?.get("error");
  return (
    <div className="w-full max-w-md rounded-lg p-6 flex flex-col items-center min-h-[100dvh] mx-auto lg:justify-center lg:h-full relative">
      <SandwormLogo width="40" height="40" />

      <h2 className="xl:text-3xl text-2xl  font-medium text-center text-black mb-1 mt-3 font-body  dark:text-white">
        Welcome back
      </h2>

      <p className="text-ink-200  font-body font-medium text-sm mt-1 xl:mb-6 mb-2.5">
        Sign into Sandworm
      </p>

      {error === "NoAccount" && (
        <div className="w-full text-sm font-body  bg-red-50 text-error border border-red-200 rounded-md p-3 mb-3">
          No account found. Please sign up first.
        </div>
      )}

      <SocialLogin variant="signin" />

      <div className="flex items-center justify-center lg:justify-normal gap-3 w-full lg:my-2.5 my-0.5">
        <div className="h-px bg-border-secondary dark:bg-white/[18.8%] flex-1 lg:block hidden" />
        <span className="text-sm text-ink-100 font-medium font-body text-center ">
          or
        </span>
        <div className="h-px bg-border-secondary dark:bg-white/[18.8%] flex-1 lg:block hidden" />
      </div>

      <SignInForm />

      <div className="flex justify-between w-full text-sm font-body mt-3">
        <Link
          href="/signup"
          className="text-accent dark:text-primary hover:underline font-medium"
        >
          Sign Up
        </Link>

        <Link href="/reset" className="text-error hover:underline font-medium">
          Reset Password
        </Link>
      </div>

      {/*  <div className="flex-col gap-2 w-full flex items-center justify-center mt-auto pt-6 lg:absolute xl:bottom-[3rem] bottom-[1rem]">
        <p className="xl:text-base text-sm text-ink-400 dark:text-ink-400 font-body font-medium lg:mb-4 mb-1">
          Trusted by teams at
        </p>
        <PartnersSection />
      </div> */}
      <p className="font-body font-medium text-center text-xs text-ink-400 mt-6 absolute bottom-4 max-w-[19rem]">
        By continuing, you agree to the{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        and confirm that you have read the{" "}
        <span className="underline">Privacy Policy</span>.
      </p>
    </div>
  );
};
