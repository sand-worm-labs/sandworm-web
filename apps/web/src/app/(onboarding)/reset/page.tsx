"use client";

import { useState } from "react";

import { CheckMail } from "@/components/AuthUI/CheckMail";
import { ForgotPasswordForm } from "@/components/AuthUI/ForgetPasswordForm";
import { SandwormLogo } from "@/components/Assets";
import Link from "next/link";

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
    <div className="w-full max-w-md rounded-lg  p-6 content flex flex-col justify-center items-center h-full mx-auto font-primary">
      <SandwormLogo />
      <h2 className="text-2xl font-medium text-center text-black mb-2 mt-4 font-primary dark:text-white">
        Reset your password
      </h2>
      <p className="mb-6 text-[#455768] text-sm text-center">
        Enter the email associated with your account and we will send a link to
        reset your password{" "}
      </p>
      <ForgotPasswordForm onSuccess={handleSuccess} />
      <div className="text-center flex justify-between items-center">
        <Link
          href="/reset"
          className="text-[#1A1A1A] hover:underline mt-4 text-sm font-body"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
