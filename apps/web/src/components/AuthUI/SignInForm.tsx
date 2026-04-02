"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

import { useLogin } from "../Editor/hooks/useAuth";
import { Spinner } from "../Spinner/Spinner";

// =====================================
// ⬢ Sign In Form Main Component
// =====================================
export const SignInForm = () => {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");
  const [state, { loginWithPassword }] = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  // ⬢ API Error Mapping
  // =====================================
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
  }, [state.error]);

  // ⬢ Handle Form Change
  // =====================================
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError("");
  }, []);

  // ⬢ Submit Handler
  // =====================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setLocalError("All fields are required.");
      return;
    }

    const callbackUrl = searchParams.get("callback") || "/workspace";
    loginWithPassword(email, password, decodeURIComponent(callbackUrl));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2 w-full font-body">
      <div>
        <input
          type="email"
          name="email"
          className="mt-1 w-full font-body rounded-3xl dark:bg-base-400 bg-[#FFFFFF] p-2.5 px-5 text-ink-100 dark:text-white border border-[#DEE2E6] dark:border-border-tertiary focus:border-[#A308F0] focus:ring-1 focus:ring-[#A308F0] outline-none font-medium text-[0.9rem] placeholder:text-muted-foreground dark:placeholder:text-ink-400"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          className="mt-1 w-full font-body rounded-3xl dark:bg-base-400 bg-[#FFFFFF] p-2.5 px-5 pr-12 text-ink-100 dark:text-white border border-[#DEE2E6] focus:border-[#A308F0] focus:ring-1 focus:ring-[#A308F0] outline-none font-medium text-[0.9rem] placeholder:text-muted-foreground dark:placeholder:text-ink-400 dark:border-border-tertiary"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-4 top-1/2 translate-y-[-50%] text-ink-400 dark:text-ink-400 hover:text-ink-100 dark:hover:text-white transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <MdVisibilityOff size={18} />
          ) : (
            <MdVisibility size={18} />
          )}
        </button>
      </div>

      {localError && (
        <p className="text-sm text-error font-body">{localError}</p>
      )}

      <button
        type="submit"
        disabled={state.loading}
        className="w-full rounded-3xl bg-[#0F0F0F] hover:opacity-85 dark:bg-white dark:text-black px-4 py-3.5 text-white font-medium disabled:bg-[#868E96] text-sm font-body flex items-center justify-center gap-2"
      >
        {state.loading ? (
          <>
            <Spinner />
            Signing In...
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
};
