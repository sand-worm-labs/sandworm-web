"use client";

import { useState, useEffect } from "react";
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
      setLocalError("Invalid email or password. Please try again");
    } else if (state.error === "network-error") {
      setLocalError(
        "Network error. Please check your connection and try again."
      );
    } else if (state.error === "unexpected") {
      setLocalError("An unexpected error occurred. Please try again.");
    }

    if (state.data && state.data.user) {
      console.log("Login successful:", state.data);
      const callbackUrl = searchParams.get("callback") || "/workspace";
      setTimeout(() => {
        router.push(decodeURIComponent(callbackUrl));
      }, 100);
    }
  }, [state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setLocalError("All fields are required.");
      console.warn("Form validation failed: Empty fields");
      return;
    }

    console.log("Attempting login with:", { email });
    loginWithPassword(email, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 w-full font-primary"
    >
      <div>
        <label className="block text-sm font-medium dark:text-gray-300">
          Email
        </label>
        <input
          type="email"
          name="email"
          className="mt-1 w-full rounded-md dark:bg-[#121417] bg-[#F1F3F4] p-2 text-black dark:text-white focus:border-orange-500 focus:ring-orange-500 border border-[#DEE2E6] dark:border-[#262A30] font-normal text-[0.9rem] placeholder:text-[#455768] dark:placeholder:text-[#868E96"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium dark:text-gray-300">
          Password
        </label>
        <input
          type="password"
          name="password"
          className="mt-1 w-full rounded-md dark:bg-[#121417] bg-[#F1F3F4] p-2 text-black dark:text-white focus:border-orange-500 focus:ring-orange-500 border border-[#DEE2E6] dark:border-[#262A30] font-normal text-[0.9rem] placeholder:text-[#455768] dark:placeholder:text-[#868E96"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={state.loading}
        className="w-full rounded-md bg-orange-600 px-4 py-2 text-white font-medium disabled:bg-orange-300"
      >
        {state.loading ? "Signing Up..." : "Sign in"}
      </button>
    </form>
  );
};
