"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useSignup } from "../Visualization/hooks/useAuth";
import { Spinner } from "../Spinner/Spinner";

type Step = 1 | 2;

export default function SignUpForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [localError, setLocalError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [state, { signupWithEmail }] = useSignup();

  // refs for autofocus
  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1) {
      firstNameRef.current?.focus();
    }

    if (step === 2) {
      emailRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (state.data?.email) {
      router.push(`/check-mail?email=${encodeURIComponent(state.data.email)}`);
    }
  }, [state.data, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNext = () => {
    const { firstName, lastName } = formData;

    if (!firstName.trim() || !lastName.trim()) {
      setLocalError("First and last name are required.");
      return;
    }

    setLocalError("");
    setStep(2);
  };

  const handleBack = () => {
    setLocalError("");
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const { firstName, lastName, email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }

    signupWithEmail(email, password, firstName, lastName);
  };

  const displayError =
    state.error === "unexpected"
      ? "An unexpected error occurred. Please try again."
      : localError;

  return (
    <form
      onSubmit={step === 2 ? handleSubmit : e => e.preventDefault()}
      className="mt-4 space-y-3 font-primary w-full"
    >
      {step === 1 && (
        <>
          <input
            ref={firstNameRef}
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 w-full rounded-3xl dark:bg-[#121417] bg-white p-2.5 px-5 text-ink-100 dark:text-white border border-[#DEE2E6] dark:border-[#262A30] focus:border-primary focus:ring-1 focus:ring-[#A308F0] outline-none text-[0.9rem]"
          />

          <input
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 w-full rounded-3xl dark:bg-[#121417] bg-white p-2.5 px-5 text-ink-100 dark:text-white border border-[#DEE2E6] dark:border-[#262A30] focus:border-primary focus:ring-1 focus:ring-[#A308F0] outline-none text-[0.9rem]"
          />

          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-3xl bg-[#0F0F0F] py-3.5 text-white font-medium text-sm"
          >
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            ref={emailRef}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-3xl dark:bg-[#121417] bg-white p-2.5 px-5 text-ink-100 dark:text-white border border-[#DEE2E6] dark:border-[#262A30] focus:border-primary focus:ring-1 focus:ring-[#A308F0] outline-none text-[0.9rem]"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-3xl dark:bg-[#121417] bg-white p-2.5 px-5 text-ink-100 dark:text-white border border-[#DEE2E6] dark:border-[#262A30] focus:border-primary focus:ring-1 focus:ring-[#A308F0] outline-none text-[0.9rem]"
          />

          <button
            type="submit"
            disabled={state.loading}
            className="w-full rounded-3xl bg-[#0F0F0F] px-4 py-3.5 text-white font-medium disabled:bg-[#868E96] text-sm font-body flex items-center justify-center gap-2"
          >
            {state.loading ? (
              <>
                <Spinner />
                Creating Account
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </>
      )}

      {displayError && <p className="text-error text-sm">{displayError}</p>}
    </form>
  );
}
