"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSessionStore } from "@/store/session";
import { NEXT_PUBLIC_API_URL } from "@/components/Visualization/utils/env";

type SocialLoginProps = {
  variant?: "signup" | "signin";
};

export const SocialLogin = ({ variant = "signup" }: SocialLoginProps) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const { setIntent } = useSessionStore();

  const openOAuthPopup = (provider: string) => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const url = `${NEXT_PUBLIC_API_URL()}/auth/${provider}/login?intent=${variant}`;

    const popup = window.open(
      url,
      `${provider}-oauth-popup`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no`
    );

    if (!popup) {
      return null;
    }

    return popup;
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setIsLoading(provider);
    setIntent(variant);

    const popup = openOAuthPopup(provider);
    if (!popup) {
      setIsLoading(null);
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (
        event.data.type === "oauth-success" &&
        event.data.provider === provider
      ) {
        window.removeEventListener("message", handleMessage);
        setIsLoading(null);
        popup.close();

        if (variant === "signup") {
          router.push("/claim");
        } else {
          router.push("/workspace");
        }
      }

      if (
        event.data.type === "oauth-error" &&
        event.data.provider === provider
      ) {
        window.removeEventListener("message", handleMessage);
        setIsLoading(null);
        popup.close();
        alert(`Authentication failed: ${event.data.error || "Unknown error"}`);
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        setIsLoading(null);
      }
    }, 500);
  };

  const getGoogleButtonText = () => {
    if (isLoading === "google") return "Connecting...";
    return variant === "signup" ? "Sign up with Google" : "Sign in with Google";
  };

  const getGithubButtonText = () => {
    if (isLoading === "github") return "Connecting...";
    return variant === "signup" ? "Sign up with Github" : "Sign in with Github";
  };

  return (
    <div className="w-full mt-4">
      <button
        type="button"
        onClick={() => handleOAuthLogin("google")}
        disabled={isLoading !== null}
        className="flex w-full items-center justify-center space-x-2 rounded-xl border border-[#DEE2E6] px-4 py-3 bg-[#F8F9FA] hover:bg-btnHover dark:bg-white text-black mb-4 text-sm font-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FcGoogle size={20} />
        <span>{getGoogleButtonText()}</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuthLogin("github")}
        disabled={isLoading !== null}
        className="flex w-full items-center justify-center space-x-2 rounded-xl border border-[#DEE2E6] px-4 py-3 bg-[#F8F9FA] hover:bg-btnHover dark:bg-white text-black mb-4 text-sm font-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaGithub size={20} />
        <span>{getGithubButtonText()}</span>
      </button>
    </div>
  );
};
