"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SandwormLogo } from "../Assets";

import { SocialLogin } from "./SocialLogin";
import SignUpForm from "./SignUpForm";

// =====================================
// ⬢ SignUp Component
// =====================================
export const SignUp = () => {
  const searchParams = useSearchParams();
  const isUsernameStep = searchParams.get("step") === "3";

  return (
    <div className="w-full max-w-md rounded-lg p-6 content flex flex-col justify-center items-center h-full mx-auto text-black dark:text-white">
      {!isUsernameStep && (
        <>
          <SandwormLogo width="40" height="40" />

          <h2 className="xl:text-3xl text-2xl font-medium text-center text-black mb-1 mt-3 font-body  dark:text-white">
            Welcome to Sandworm
          </h2>

          <p className="text-ink-200 font-body font-medium text-sm mt-1 xl:mb-6 mb-2.5">
            Sign up in 3 steps
          </p>

          <SocialLogin variant="signin" />

          <div className="flex items-center gap-3 w-full my-2.5">
            <div className="h-px bg-border-secondary dark:bg-white/[18.8%] flex-1" />
            <span className="text-xs text-ink-400 font-body ">or</span>
            <div className="h-px bg-border-secondary dark:bg-white/[18.8%] flex-1" />
          </div>
        </>
      )}

      <SignUpForm />

      {!isUsernameStep && (
        <p className="text-center text-ink-500 dark:text-ink-400 font-body  text-sm mt-4">
          Have an account?
          <Link
            href="/signin"
            className="text-accent dark:text-primary hover:underline ml-1"
          >
            Sign In
          </Link>
        </p>
      )}

      <div className="flex-col gap-2 absolute xl:bottom-[3rem] bottom-[1rem] w-full flex items-center justify-center">
        {!isUsernameStep && (
          /*      <>
                 <p className="xl:text-base text-sm text-ink-200 font-body font-medium mb-2.5">
                   Trusted by teams at
                 </p>
                 <PartnersSection />
               </> */

          <p className="font-body font-medium text-center text-xs text-ink-400 mt-6 absolute bottom-4 max-w-[19rem]">
            By continuing, you agree to the{" "}
            <span className="underline">Terms</span> and confirm that you have
            read the <span className="underline">Privacy Policy</span>.
          </p>
        )}
      </div>
    </div>
  );
};
