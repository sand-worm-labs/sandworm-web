"use client";

import Link from "next/link";

import { SocialLogin } from "./SocialLogin";
import { SandwormLogo } from "../Assets";
import { SignInForm } from "./SignInForm";
import SignUpForm from "./SignUpForm";

export const SignUp = () => {
  return (
    <div className="w-full max-w-md rounded-lg p-6 content flex flex-col justify-center items-center h-full mx-auto text-black dark:text-white">
      <SandwormLogo />
      <h2 className="text-3xl font-medium text-center text-black dark:text-white mb-3 mt-4">
        <span className="font-primary">Welcome to </span>
        <span className="uppercase font-bold">Sandworm!</span>
      </h2>
      <p className="text-muted-foreground dark:text-white text-sm mb-6 font-primary">
        Sign up in 2 steps
      </p>
      <SignUpForm />

      <p className=" text-center text-muted-foreground font-primary mt-4">
        Have an account?
        <Link href="/signin" className="text-[#8053FE] hover:underline ml-1">
          Sign In
        </Link>
      </p>
    </div>
  );
};
