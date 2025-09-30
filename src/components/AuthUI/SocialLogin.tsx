"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { useTransition } from "react";

export const SocialLogin = () => {
  const [, startTransition] = useTransition();

  const handleGoogleSignIn = async () => {
    startTransition(async () => {
      await signIn("google");
    });
  };

  const handleGithubSignIn = async () => {
    startTransition(async () => {
      await signIn("github");
    });
  };

  return (
    <div className="mt-3 ">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center space-x-2 rounded-xl border border-[#DEE2E6]   px-4 py-3  bg-[#F8F9FA]  hover:bg-btnHover text-black mb-4 text-sm "
      >
        <FcGoogle size={20} />
        <span>Sign up with Google</span>
      </button>

      <button
        type="button"
        onClick={handleGithubSignIn}
        className="flex w-full items-center justify-center space-x-2 border border-[#ffffff50] rounded-xl px-4 py-3 text-white text-sm hover:bg-btnHover bg-black"
      >
        <FaGithub size={20} />
        <span>Sign up with Github</span>
      </button>
    </div>
  );
};
