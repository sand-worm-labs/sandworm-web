"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { SandwormLogo } from "@/components/Assets";
import { ResetPasswordForm } from "@/components/AuthUI/ResetPasswordForm";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("hash");

  const [success, setSuccess] = useState(false);

  // ⬢ Handle Success
  // =====================================
  const handleSuccess = () => {
    setSuccess(true);
  };

  if (!token) {
    return (
      <div className="w-full mx-auto text-center font-primary h-full items-center justify-center flex flex-col">
        <SandwormLogo />
        <h2 className="mt-4 text-xl font-medium text-black dark:text-white">
          Invalid or expired link
        </h2>
        <p className="mt-2 text-sm text-ink-200">
          This password reset link is no longer valid.
        </p>
        <Link href="/forgot-password" className="text-sm mt-6">
          Request a new one
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center font-primary  h-full items-center justify-center flex flex-col">
        <SandwormLogo />
        <h2 className="mt-4 text-2xl font-medium text-black dark:text-white">
          Password updated
        </h2>
        <p className="mt-2 text-sm text-ink-200">
          You can now log in with your new password.
        </p>
        <Link href="/signin" className="inline-block mt-6 text-sm underline">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg p-6 flex flex-col justify-center items-center h-full mx-auto font-primary">
      <SandwormLogo />
      <h2 className="text-2xl font-medium text-center text-black mb-2 mt-4 dark:text-white">
        Reset your Password
      </h2>
      <p className="mb-6 text-ink-200 text-sm text-center">
        Please create a new password, please note your new password cannot be
        the same as your old password.
      </p>

      <ResetPasswordForm token={token} onSuccess={handleSuccess} />
    </div>
  );
}
