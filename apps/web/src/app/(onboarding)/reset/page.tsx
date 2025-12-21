"use client";

import { useState } from "react";

import { CheckMail } from "@/components/AuthUI/CheckMail";
import { ForgotPasswordForm } from "@/components/AuthUI/ForgetPasswordForm";
import { SandwormDarkLogo } from "@/components/Assets/SandwormDarkLogo";

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
    <div className="w-full max-w-md rounded-lg  p-6 content flex flex-col justify-center items-center h-full mx-auto">
      <SandwormDarkLogo />
      <h2 className="text-2xl font-medium text-center text-black mb-6 mt-4 font-primary dark:text-white">
        Reset your password
      </h2>
      <ForgotPasswordForm onSuccess={handleSuccess} />
    </div>
  );
}
