"use client";

import { useState } from "react";
import { z } from "zod";

import type { UseAuthError } from "../Visualization/hooks/useAuth";

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

const useResetPassword = () => {
  return null;
};

export const ResetPasswordForm = ({
  token,
  onSuccess,
}: ResetPasswordFormProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const [state, { resetPassword }] = useResetPassword();

  // ⬢ Submit Handler
  // =====================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⬢ Zod Validation
    const result = passwordSchema.safeParse(password);

    if (!result.success) {
      setLocalError(result.error.errors[0].message);
      return;
    }

    // ⬢ Confirm Password Check
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    setLocalError("");

    const success = await resetPassword({
      token,
      password,
    });

    if (success) {
      onSuccess?.();
    }
  };

  // ⬢ API Error Mapping
  // =====================================
  const getErrorMessage = (error: UseAuthError | undefined) => {
    if (error === "invalid-token") {
      return "This password reset link is invalid or has expired. Please request a new one.";
    }

    if (error === "weak-password") {
      return "Password must contain at least 8 characters, one uppercase letter, and one number.";
    }

    if (error === "unexpected") {
      return "An unexpected error occurred. Please try again later.";
    }

    return "";
  };

  const apiErrorMessage = getErrorMessage(state.error);

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 w-full font-primary"
    >
      <div>
        <label className="block text-sm font-medium text-ink-200 dark:text-gray-300">
          New Password
        </label>
        <input
          type="password"
          className="mt-1 w-full rounded-3xl bg-white dark:bg-[#121417] p-2.5 px-5 border border-[#DEE2E6] dark:border-[#262A30]"
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
          className="mt-1 w-full rounded-3xl bg-white dark:bg-[#121417] p-2.5 px-5 border border-[#DEE2E6] dark:border-[#262A30]"
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
        className="w-full rounded-3xl bg-[#0F0F0F] px-4 py-3.5 text-white text-sm font-medium disabled:bg-[#868E96]"
      >
        {state.loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
};
