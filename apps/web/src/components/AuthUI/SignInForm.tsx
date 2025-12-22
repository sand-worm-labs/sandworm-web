"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useLogin, tokenStorage } from "../Visualization/hooks/useAuth";

export const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");
  const [state, { loginWithPassword }] = useLogin();

  useEffect(() => {
    const token = tokenStorage.getToken();

    if (token && !tokenStorage.isTokenExpired()) {
      const callbackUrl = searchParams.get("callback") || "/workspace";
      router.push(decodeURIComponent(callbackUrl));
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (state.error === "invalid-creds") {
      setLocalError("Invalid email or password. Please try again.");
    } else if (state.error === "network-error") {
      setLocalError(
        "Network error. Please check your connection and try again."
      );
    } else if (state.error === "unexpected") {
      setLocalError("An unexpected error occurred. Please try again.");
    }
    // 💭 todo on multiple invalid creds redirect to reset password page

    if (state.data && state.data.loginLink) {
      const callbackUrl = searchParams.get("callback") || "/workspace";
      router.push(decodeURIComponent(callbackUrl));
    }
  }, [state, router, searchParams]);

  // ⬢ Handle Input Change
  // =====================================
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError("");
  }, []);

  // ⬢ Handle Form Submission
  // =====================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setLocalError("All fields are required.");
      return;
    }

    loginWithPassword(email, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 w-full font-primary"
    >
      <div>
        <label className="block text-sm font-medium dark:text-gray-300 text-[#455768]">
          Email
        </label>
        <input
          type="email"
          name="email"
          className="mt-1 w-full rounded-md dark:bg-[#121417] bg-[#F1F3F4] p-2 text-black dark:text-white border border-[#DEE2E6] dark:border-[#262A30] focus:border-[#C7665C] focus:ring-1 focus:ring-[#C7665C] outline-none font-normal text-[0.9rem] placeholder:text-[#455768] dark:placeholder:text-[#868E96]"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium dark:text-gray-300 text-[#455768]">
          Password
        </label>
        <input
          type="password"
          name="password"
          className="mt-1 w-full rounded-md dark:bg-[#121417] bg-[#F1F3F4] p-2 text-black dark:text-white border border-[#DEE2E6] dark:border-[#262A30] focus:border-[#C7665C] focus:ring-1 focus:ring-[#C7665C] outline-none font-normal text-[0.9rem] placeholder:text-[#455768] dark:placeholder:text-[#868E96]"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      {localError && <p className="text-sm text-red-500">{localError}</p>}

      <button
        type="submit"
        disabled={state.loading}
        className="w-full rounded-xl bg-[#C7665C] px-4 py-3 text-white font-medium disabled:bg-[#C7665C]/40 text-sm"
      >
        {state.loading ? "Signing In..." : "Sign in"}
      </button>
    </form>
  );
};
