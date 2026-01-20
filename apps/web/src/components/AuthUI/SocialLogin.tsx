"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";

import { useSessionStore } from "@/store/session";
import {
  NEXT_PUBLIC_API_URL,
  GITHUB_CLIENT_ID,
  REDIRECT_URI,
} from "@/components/Visualization/utils/env";

type SocialLoginProps = {
  variant?: "signup" | "signin";
};

export const SocialLogin = ({ variant = "signup" }: SocialLoginProps) => {
  const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);
  const router = useRouter();
  const { setIntent, setSession } = useSessionStore();

  const handleBackendLogin = async (
    provider: "google" | "github",
    code: string
  ) => {
    try {
      const res = await fetch(
        `${NEXT_PUBLIC_API_URL()}/auth/${provider}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code, intent: variant }),
        }
      );

      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();
      setSession(data);

      router.push(variant === "signup" ? "/claim" : "/workspace");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Authentication failed");
    } finally {
      setIsLoading(null);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async response => {
      if (!response.code) return;
      setIsLoading("google");
      await handleBackendLogin("google", response.code);
    },
  });

  // GitHub popup
  const openGitHubPopup = () => {
    setIsLoading("github");
    setIntent(variant);

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID()}&redirect_uri=${REDIRECT_URI()}&scope=read:user`;

    const popup = window.open(
      githubAuthUrl,
      "github-oauth-popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      setIsLoading(null);
      return;
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (
        event.data?.type === "oauth-success" &&
        event.data.provider === "github"
      ) {
        window.removeEventListener("message", handleMessage);
        await handleBackendLogin("github", event.data.code);
        popup.close();
      }

      if (
        event.data?.type === "oauth-error" &&
        event.data.provider === "github"
      ) {
        window.removeEventListener("message", handleMessage);
        setIsLoading(null);
        popup.close();
        alert(event.data.error || "Authentication failed");
      }
    };

    window.addEventListener("message", handleMessage);

    // Detect if user manually closes the popup
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        setIsLoading(null);
      }
    }, 500);
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    if (provider === "google") {
      setIntent(variant);
      setIsLoading(provider);
      googleLogin();
    } else {
      openGitHubPopup();
    }
  };

  const getButtonText = (provider: "google" | "github") => {
    if (isLoading === provider) return "Connecting...";
    return variant === "signup"
      ? `Sign up with ${provider === "google" ? "Google" : "Github"}`
      : `Sign in with ${provider === "google" ? "Google" : "Github"}`;
  };

  return (
    <div className="w-full mt-4">
      {/* Google Login Button */}
      <button
        type="button"
        onClick={() => handleOAuthLogin("google")}
        disabled={isLoading !== null}
        className="flex w-full items-center justify-center space-x-2 rounded-xl border border-[#DEE2E6] px-4 py-3 bg-[#F8F9FA] hover:bg-[#E9ECEF] dark:bg-white text-black mb-2 text-sm font-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FcGoogle size={20} />
        <span>{getButtonText("google")}</span>
      </button>

      {/* GitHub Login Button */}
      <button
        type="button"
        onClick={() => handleOAuthLogin("github")}
        disabled={isLoading !== null}
        className="flex w-full items-center justify-center space-x-2 rounded-xl border border-[#DEE2E6] px-4 py-3 bg-[#000] hover:bg-[#333] text-white mb-4 text-sm font-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaGithub size={20} />
        <span>{getButtonText("github")}</span>
      </button>
    </div>
  );
};
