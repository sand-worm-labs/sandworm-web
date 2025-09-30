"use client";

import Link from "next/link";
import Image from "next/image";

import { SandwormLogo } from "../Assets/SandwormLogo";

import { SocialLogin } from "./SocialLogin";
import { ConnectWallet } from "./ConnectWallet";

export const SignIn = () => {
  return (
    <div className=" min-h-screen  p-6 line-bg relative">
      <div className="grid grid-cols-2">
        <div className="w-full max-w-md rounded-lg border border-[#ffffff30] p-6 content flex flex-col justify-center mx-auto">
          <SandwormLogo />

          <h2 className="text-3xl font-medium text-center text-black mb-6 mt-4">
            Welcome to <span className="uppercase font-bold">Sandworm</span>
          </h2>

          <SocialLogin />
          <ConnectWallet />
          <p className=" text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-orange-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        <div>
          <Image
            alt=" banner image"
            src="/img/sample.png"
            width="678"
            height="789"
          />
        </div>
      </div>
    </div>
  );
};
