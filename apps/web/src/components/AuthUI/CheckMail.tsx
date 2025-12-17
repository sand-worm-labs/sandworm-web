"use client";

import Image from "next/image";

type CheckMailProps = {
  variant?: "signup" | "reset-password";
  email?: string;
  onResend?: () => void;
};

export const CheckMail = ({
  variant = "signup",
  email,
  onResend,
}: CheckMailProps) => {
  const content = {
    signup: {
      title: "Check your Mail!",
      description: (
        <>
          Congrats! Please click the link sent to your{" "}
          <span className="font-semibold">{email || "email"}</span> to complete
          your account creation process.
        </>
      ),
      resendText: "Did not get an email?",
    },
    "reset-password": {
      title: "Check your Mail!",
      description: (
        <>
          We&apos;ve sent a password reset link to{" "}
          <span className="font-semibold">{email || "your email"}</span>. Please
          check your inbox and follow the instructions.
        </>
      ),
      resendText: "Did not get an email?",
    },
  };

  const { title, description, resendText } = content[variant];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-10 py-6 overflow-hidden text-center">
      <div className="w-12 h-12 rounded-xl bg-[#EDE7FF] flex items-center justify-center mb-4">
        <Image src="/img/mail.png" width={24} height={24} alt="mail" />
      </div>
      <h2 className="text-xl font-semibold roobert">{title}</h2>
      <p className="text-sm font-medium text-muted-foreground dark:text-white font-primary max-w-md mt-2">
        {description}
      </p>
      <p className="text-sm font-primary mt-2">
        {resendText}{" "}
        <button
          type="button"
          onClick={onResend}
          className="text-[#8053FE] underline cursor-pointer"
        >
          Resend
        </button>
      </p>
      {variant === "signup" && (
        <p className="font-primary text-center text-xs text-muted-foreground mt-6">
          By creating an account you agree to the{" "}
          <span className="underline">Terms</span> and confirm that you have
          read the <span className="underline">Privacy Policy</span>.
        </p>
      )}
    </div>
  );
};
