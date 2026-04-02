"use client";

import { useState, useCallback, useEffect } from "react";

import { useForgotPassword } from "../Editor/hooks/useAuth";
import type { UseAuthError } from "../Editor/hooks/useAuth";

type ForgotPasswordFormProps = {
  onSuccess?: (email: string) => void;
};

// =====================================
// ⬢ Forgot Password Form Main Component
// =====================================
export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [state, { sendResetEmail }] = useForgotPassword();

  useEffect(() => {
    if (state.data && state.data.email) {
      onSuccess?.(state.data.email);
    }
  }, [state.data, onSuccess]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    sendResetEmail(email);
  };

  const getErrorMessage = (error: UseAuthError | undefined) => {
    if (error === "invalid-creds")
      return "Email not found. Please check and try again.";
    if (error === "unexpected")
      return "An unexpected error occurred. Please try again.";
    return "";
  };

  const errorMessage = getErrorMessage(state.error);
  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 w-full font-body ">
      <div>
        <label className="block text-sm font-medium dark:text-white text-ink-200">
          Email
        </label>
        <input
          type="email"
          name="email"
          className="mt-1 w-full rounded-3xl dark:bg-base-100 bg-[#FFFFFF] p-2.5 px-5 text-black dark:text-white border border-[#DEE2E6] dark:border-border-tertiary focus:border-[#A308F0] focus:ring-1 focus:ring-[#A308F0] outline-none font-medium text-[0.9rem] placeholder:text-muted-foreground dark:placeholder:text-ink-400 "
          placeholder="Enter your email"
          value={email}
          onChange={handleChange}
        />
      </div>

      {errorMessage && <p className="text-sm text-error">{errorMessage}</p>}

      <button
        type="submit"
        disabled={state.loading}
        className="w-full rounded-3xl bg-[#0F0F0F] px-4 py-3.5 text-white font-medium disabled:bg-[#868E96] text-sm dark:bg-white dark:text-black"
      >
        {state.loading ? "Sending..." : "Send Reset Email"}
      </button>
    </form>
  );
};
