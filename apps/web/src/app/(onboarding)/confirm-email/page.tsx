"use client";

import { useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Mail } from "@/components/Assets/Mail";
import { useConfirmEmail } from "@/components/Visualization/hooks/useAuth";
import { Cautious } from "@/components/Assets/Cautious";
import { OnboardingFooter } from "@/components/AuthUI/OnboardingFooter";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hash = searchParams.get("hash");
  const hasAttempted = useRef(false);

  const [state, { confirmEmail }] = useConfirmEmail();

  useEffect(() => {
    if (hash && !hasAttempted.current) {
      hasAttempted.current = true;
      confirmEmail(hash);
    }
  }, [hash, confirmEmail]);

  useEffect(() => {
    if (!state.success) return () => {};

    const timer = setTimeout(() => {
      router.push("/signin");
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.success, router]);

  if (!hash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#EDE7FF] flex items-center justify-center mb-4">
            <Cautious />
          </div>
          <h1 className="text-xl font-medium font-body text-ink-100">
            Invalid Link
          </h1>
          <p className="text-ink-300 font-body font-medium dark:text-ink-300">
            This confirmation link is invalid. Please check your email for the
            correct link.
          </p>
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="w-full text-sm font-body mt-6 inline-block px-6 py-3.5 rounded-[20px] bg-[#0F0F0F] text-white font-medium"
          >
            Back to Sign Up
          </button>
        </div>
        <div className="absolute bottom-5 w-full">
          <OnboardingFooter />
        </div>
      </div>
    );
  }

  // Loading state
  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
        <div className="max-w-md w-full text-center space-y-2 flex-col items-center justify-center">
          <div className="w-12 h-12 mx-auto rounded-xl  flex items-center justify-center mb-4">
            <Mail />
          </div>
          <h1 className="text-xl font-medium font-body text-ink-100 ">
            <Loader2 className="w-4 h-4 text-primary animate-spin mx-auto" />
            Verifying your email...
          </h1>
          <p className="text-ink-300 font-body font-medium dark:text-ink-300">
            Please wait while we confirm your email address.
          </p>
        </div>
        <div className="absolute bottom-5 w-full">
          <OnboardingFooter />
        </div>
      </div>
    );
  }

  // Success state
  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
        <div className="max-w-md w-full text-center gap-y-2 flex-col items-center justify-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#EDE7FF] flex items-center justify-center mb-4">
            <Mail />
          </div>
          <h1 className="text-xl font-medium font-body text-ink-100">
            Email Confirmed!
          </h1>
          <p className="text-ink-300 font-body font-medium dark:text-ink-300 mt-2">
            Your email has been verified successfully. Redirecting you to sign
            in...
          </p>
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="w-full text-sm font-body mt-6 inline-block px-6 py-3.5 rounded-[20px] bg-[#0F0F0F] text-white font-medium"
          >
            Sign In Now
          </button>
        </div>
        <div className="absolute bottom-5 w-full">
          <OnboardingFooter />
        </div>
      </div>
    );
  }

  // Error states
  const errorConfig = {
    expired: {
      icon: <Cautious />,
      title: "Link Expired",
      message: "This confirmation link has expired. Please request a new one.",
      showResend: true,
    },
    invalid: {
      icon: <Cautious />,
      title: "Invalid Link",
      message: "This confirmation link is invalid or has already been used.",
      showResend: true,
    },
    unexpected: {
      icon: <Cautious />,
      title: "Something Went Wrong",
      message: "An unexpected error occurred. Please try again later.",
      showResend: false,
    },
  };

  const error = errorConfig[state.error || "unexpected"];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      <div className="max-w-md w-full text-center gap-y-2 flex-col items-center justify-center">
        <div className="w-12 h-12 mx-auto rounded-xl bg-[#EDE7FF] flex items-center justify-center mb-4">
          {error.icon}
        </div>
        <h1 className="text-xl font-medium font-body text-ink-100">
          {error.title}
        </h1>
        <p className="text-ink-300 font-body font-medium dark:text-ink-300 mt-2">
          {error.message}
        </p>
        <div className="flex flex-col gap-2 ">
          {error.showResend && (
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="w-full text-sm font-body mt-6 inline-block px-6 py-3.5 rounded-[20px] bg-[#0F0F0F] text-white font-medium"
            >
              Sign Up Again
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="px-6 text-sm py-3 mt-1 font-body border-none  text-ink-100 dark:text-white font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
      <div className="absolute bottom-5 w-full">
        <OnboardingFooter />
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
