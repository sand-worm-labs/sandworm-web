"use client";

import { Mail } from "../Assets/Mail";

type CheckMailProps = {
  variant?: "signup" | "reset-password";
  email?: string;
  onResend?: () => void;
};

// =====================================
// ⬢ CheckMail Main Component
// =====================================
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
    <div className="flex flex-col items-center justify-center h-full w-full px-10 py-6 overflow-hidden text-center ">
      <div className="w-12 h-12 rounded-xl  flex items-center justify-center mb-2">
        <Mail />
      </div>
      <h2 className="text-xl font-body  mb-1 ">{title}</h2>
      <p className="text-sm font-medium text-ink-400 dark:text-white font-body max-w-md mt-2">
        {description}
      </p>

      <div className="bg-[#E9ECEF] h-[1px]  w-48 mt-2.5" />
      <p className="text-sm font-body font-medium text-ink-400 mt-2">
        {resendText}{" "}
        <button
          type="button"
          onClick={onResend}
          className="text-accent underline cursor-pointer"
        >
          Resend
        </button>
      </p>

      {variant === "signup" && (
        <p className="font-body font-medium text-center text-xs text-ink-400 mt-6 absolute bottom-4 max-w-[19rem]">
          By creating an account you agree to the{" "}
          <span className="underline">Terms</span> and confirm that you have
          read the <span className="underline">Privacy Policy</span>.
        </p>
      )}
    </div>
  );
};
