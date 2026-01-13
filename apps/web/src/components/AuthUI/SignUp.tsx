"use client";

import Link from "next/link";

import { SocialLogin } from "./SocialLogin";
import { PartnersSection } from "../Partners";

import SignUpForm from "./SignUpForm";

export const SignUp = () => {
  return (
    <div className="w-full max-w-md rounded-lg p-6 content flex flex-col justify-center items-center h-full mx-auto text-black dark:text-white">
      <SocialLogin variant="signin" />

      <div className="flex items-center gap-3 w-full my-2.5">
        <div className="h-px bg-[#E9ECEF] dark:bg-[#FFFFFF30] flex-1" />
        <span className="text-xs text-muted-foreground font-primary">or</span>
        <div className="h-px bg-[#E9ECEF] dark:bg-[#FFFFFF30] flex-1" />
      </div>

      <SignUpForm />

      <p className=" text-center text-[#343A40] font-primary text-sm mt-4">
        Have an account?
        <Link href="/signin" className="text-[#8053FE] hover:underline ml-1">
          Sign In
        </Link>
      </p>

      <div className="flex-col  gap-2 absolute bottom-[4rem] w-full flex items-center justify-center">
        <p className="text-base text-[#455768] font-primary mb-4">
          Trusted by teams at
        </p>
        <PartnersSection />
      </div>
    </div>
  );
};
