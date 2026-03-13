"use client";

import { useState, useEffect } from "react";
import { z } from "zod";

import { useResetPassword } from "../Visualization/hooks/useAuth";

// ⬢ Password Validation Schema
// =====================================
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

type ResetPasswordFormProps = {
  token: string;
  onSuccess?: () => void;
};

export const ResetPasswordForm = ({
  token,
  onSuccess,
}: ResetPasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const [state, { resetPassword }] = useResetPassword();

  // ⬢ Trigger onSuccess when data indicates success
  // =====================================
  useEffect(() => {
    if (state.data?.success) {
      onSuccess?.();
    }
  }, [state.data?.success, onSuccess]);

  // ⬢ Submit Handler
  // =====================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ⬢ Zod Validation
    const result = passwordSchema.safeParse(password);

    if (!result.success) {
      setLocalError(result?.error?.errors?.[0]?.message ?? "");
      return;
    }

    // ⬢ Confirm Password Check
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setLocalError("");
    resetPassword(password, token);
  };

  // ⬢ API Error Mapping
  // =====================================
  const getErrorMessage = (error: string | undefined) => {
    if (error === "invalid-token") {
      return "This password reset link is invalid. Please request a new one.";
    }

    if (error === "expired-token") {
      return "This password reset link has expired. Please request a new one.";
    }

    if (error === "unexpected") {
      return "An unexpected error occurred. Please try again later.";
    }

    return "";
  };

  const apiErrorMessage = getErrorMessage(state.error);

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 w-full font-body ">
      <div>
        <label className="block text-sm font-medium text-ink-200 dark:text-gray-300">
          New Password
        </label>
        <input
          type="password"
          className="mt-1 w-full rounded-3xl bg-white dark:bg-base-100 p-2.5 px-5 border border-[#DEE2E6] dark:border-border-tertiary"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-200 dark:text-gray-300">
          Confirm Password
        </label>
        <input
          type="password"
          className="mt-1 w-full rounded-3xl bg-white dark:bg-base-100 p-2.5 px-5 border border-[#DEE2E6] dark:border-border-tertiary"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </div>

      {localError && <p className="text-sm text-red-500">{localError}</p>}

      {apiErrorMessage && (
        <p className="text-sm text-red-500">{apiErrorMessage}</p>
      )}

      <button
        type="submit"
        disabled={state.loading}
        className="w-full rounded-3xl bg-[#0F0F0F] dark:bg-white dark:text-black px-4 py-3.5 text-white text-sm font-medium disabled:bg-[#868E96]"
      >
        {state.loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
};
