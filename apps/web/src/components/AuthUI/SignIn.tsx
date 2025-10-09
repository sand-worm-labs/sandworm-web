"use client";

import Link from "next/link";

import { SandwormLogo } from "../Assets/SandwormLogo";

import { SocialLogin } from "./SocialLogin";

export const SignIn = () => {
  return (
    <div className="w-full max-w-md rounded-lg border border-[#ffffff30] p-6 content flex flex-col justify-center items-center h-full mx-auto">
      <SandwormLogo />

      <h2 className="text-3xl font-medium text-center text-black mb-6 mt-4">
        <span className="roobert">Welcome to </span>
        <span className="uppercase font-bold">Sandworm!</span>
      </h2>

      <SocialLogin />

      <p className=" text-center text-sm dark:text-gray-400 text-[#343A40] roobert">
        Need an account?{" "}
        <Link href="/signup" className="text-[#8053FE] hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};
