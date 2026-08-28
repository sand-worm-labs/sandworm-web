"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

import { useSessionStore } from "@/store/session";
import {
  NEXT_PUBLIC_API_URL,
  GITHUB_CLIENT_ID,
  REDIRECT_URI,
} from "@/utils/env";

type SocialLoginProps = {
  variant?: "signup" | "signin";
};

// Matches the placeholder username the backend generates for accounts
// created via social login (UserService.generateUsername) — used to decide
// whether this user still needs to claim a real handle, independent of
// which button (signup/signin) they actually clicked.
const PLACEHOLDER_USERNAME = /^user\d{8}$/;

// =====================================
// ⬢ Social Login
// =====================================
export const SocialLogin = ({ variant = "signup" }: SocialLoginProps) => {
  const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);
  const router = useRouter();
  const { setIntent, setSession } = useSessionStore();

  // ⬢ handle Backend Login
  // =====================================
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

      const needsUsernameClaim =
        !data?.user?.username || PLACEHOLDER_USERNAME.test(data.user.username);

      router.push(needsUsernameClaim ? "/claim" : "/workspace");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Authentication failed");
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

  // ⬢ Github Popup
  // =====================================
  const openGitHubPopup = () => {
    setIsLoading("github");
    setIntent(variant);

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // `user:email` is required in addition to `read:user` — without it,
    // GitHub's /user endpoint omits email for anyone who hasn't made theirs
    // public, and the backend's /user/emails fallback 403s silently.
    const githubScope = encodeURIComponent("read:user user:email");
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID()}&redirect_uri=${REDIRECT_URI()}&scope=${githubScope}`;

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
        toast.error(event.data.error || "Authentication failed");
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

  // ⬢ handleOAuthLogin
  // =====================================
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
    <div className="w-full lg:mt-4 mt-1.5 ">
      <button
        type="button"
        onClick={() => handleOAuthLogin("google")}
        disabled={isLoading !== null}
        className="flex w-full items-center justify-center space-x-2 rounded-2xl border border-border px-4 py-3 bg-inputBg hover:bg-border-secondary dark:bg-transparent font-medium text-ink-100 mb-2 text-sm font-body disabled:opacity-50 disabled:cursor-not-allowed dark:border-border-tertiary"
      >
        <FcGoogle size={20} />
        <span>{getButtonText("google")}</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuthLogin("github")}
        disabled={isLoading !== null}
        className="flex w-full items-center justify-center space-x-2 rounded-2xl border border-border px-4 py-3 bg-inputBg hover:bg-border-secondary dark:bg-transparent text-ink-100 mb-4 text-sm font-body font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:border-border-tertiary"
      >
        <FaGithub size={20} />
        <span>{getButtonText("github")}</span>
      </button>
    </div>
  );
};
