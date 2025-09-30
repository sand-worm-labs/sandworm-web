"use client";

import Link from "next/link";

import { SandwormLogo } from "../Assets/SandwormLogo";

import { SocialLogin } from "./SocialLogin";
import { ConnectWallet } from "./ConnectWallet";

export const SignUp = () => {
  return (
    <div className="w-full max-w-md rounded-lg border border-[#ffffff30] p-6 content flex flex-col justify-center items-center h-full mx-auto text-black dark:text-white">
      <SandwormLogo />

      <h2 className="text-3xl font-medium text-center text-black mb-3 mt-4">
        <span className="roobert">Welcome to </span>
        <span className="uppercase font-bold">Sandworm!</span>
      </h2>

      <p className="text-[#455768] text-sm mb-6 roobert">Sign up in 2 steps</p>

      <SocialLogin />
      <ConnectWallet />
      <p className=" text-center dark:text-gray-400 text-[#343A40] roobert">
        Already have an account?{" "}
        <Link href="/signin" className="text-[#8053FE] hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
