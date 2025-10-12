"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";

type SocialLoginProps = {
  variant?: "signup" | "signin";
};

export const SocialLogin = ({ variant = "signup" }: SocialLoginProps) => {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const { setIntent, signIn, signUp } = useSessionStore();

  const handleGoogleSignIn = async () => {
    startTransition(async () => {
      setIntent(variant);
      if (variant === "signup") {
        signUp();
        router.push("/claim");
      } else {
        signIn();
        router.push("/workspace");
      }
    });
  };

  const handleGithubSignIn = async () => {
    startTransition(async () => {
      setIntent(variant);
      if (variant === "signup") {
        signUp();
        router.push("/claim");
      } else {
        signIn();
        router.push("/workspace");
      }
    });
  };

  return (
    <div className=" w-full">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-full items-center justify-center space-x-2 rounded-xl border border-[#DEE2E6]   px-4 py-3  bg-[#F8F9FA]  hover:bg-btnHover text-black mb-4 text-sm roobert "
      >
        <FcGoogle size={20} />
        <span>
          {variant === "signup" ? "Sign up with Google" : "Sign in with Google"}
        </span>
      </button>

      <button
        type="button"
        onClick={handleGithubSignIn}
        className="flex w-full items-center justify-center space-x-2 border border-[#ffffff50] rounded-xl px-4 py-3 text-white text-sm dark:hover:bg-btnHover bg-black roobert"
      >
        <FaGithub size={20} />
        <span>
          {variant === "signup" ? "Sign up with Github" : "Sign in with Github"}
        </span>
      </button>
    </div>
  );
};
