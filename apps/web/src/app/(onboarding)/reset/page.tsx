"use client";

import { useState } from "react";
import Link from "next/link";

import { CheckMail } from "@/components/AuthUI/CheckMail";
import { ForgotPasswordForm } from "@/components/AuthUI/ForgetPasswordForm";
import { SandwormLogo } from "@/components/Assets";
import { OnboardingFooter } from "@/components/AuthUI/OnboardingFooter";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  // ⬢ Handle Success
  // =====================================
  const handleSuccess = (userEmail: string) => {
    setEmail(userEmail);
    setEmailSent(true);
  };

  // ⬢ Handle Resend
  // =====================================
  const handleResend = async () => {};

  if (emailSent) {
    return (
      <CheckMail
        variant="reset-password"
        email={email}
        onResend={handleResend}
      />
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg  p-6 content flex flex-col justify-center items-center h-full mx-auto font-body relative ">
      <SandwormLogo />
      <h2 className="text-2xl font-medium text-center text-black mb-2 mt-4 font-body  dark:text-white">
        Reset your password
      </h2>
      <p className="mb-6 text-ink-200 text-sm text-center font-medium">
        Enter the email associated with your account and we will send a link to
        reset your password{" "}
      </p>
      <ForgotPasswordForm onSuccess={handleSuccess} />
      <div className="text-center flex justify-between items-center">
        <Link
          href="/signin"
          className="text-ink-100 font-medium   hover:underline mt-4 text-sm font-body"
        >
          Back to Login
        </Link>
      </div>

      <div className="absolute bottom-4 w-full">
        {" "}
        <OnboardingFooter />{" "}
      </div>
    </div>
  );
}
