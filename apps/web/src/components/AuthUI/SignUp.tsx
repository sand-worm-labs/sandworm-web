"use client";

import Link from "next/link";

import { SocialLogin } from "./SocialLogin";
import { SandwormLogo } from "../Assets";

export const SignUp = () => {
  return (
    <div className="w-full max-w-md rounded-lg border border-[#ffffff30] p-6 content flex flex-col justify-center items-center h-full mx-auto text-black dark:text-white">
      <SandwormLogo />

      <h2 className="text-3xl font-medium text-center text-black mb-3 mt-4">
        <span className="roobert">Welcome to </span>
        <span className="uppercase font-bold">Sandworm!</span>
      </h2>

      <p className="text-muted-foreground text-sm mb-6 roobert">
        Sign up in 2 steps
      </p>

      <SocialLogin variant="signup" />
      <p className=" text-center text-muted-foreground roobert">
        Have an account?
        <Link href="/signin" className="text-[#8053FE] hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
