"use client";

import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { signInWithGoogle, signInWithGitHub } from "@/services/auth";

export default function SocialLogin() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const isOk = await signInWithGoogle();
    if (isOk) router.push("/explore");
  };

  const handleGithubSignIn = async () => {
    const isOk = await signInWithGitHub();
    if (isOk) router.push("/explore");
  };

  return (
    <div className="mt-6 flex space-x-3">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="flex w-1/2 items-center justify-center space-x-2 rounded-md border border-[#ffffff50]  px-4 py-2 text-white hover:bg-gray-600"
      >
        <FcGoogle size={20} />
        <span>Google</span>
      </button>

      <button
        type="button"
        onClick={handleGithubSignIn}
        className="flex w-1/2 items-center justify-center space-x-2 rounded-md border border-[#ffffff50]  px-4 py-2 text-white hover:bg-gray-600"
      >
        <FaGithub size={20} />
        <span>GitHub</span>
      </button>
    </div>
  );
}
