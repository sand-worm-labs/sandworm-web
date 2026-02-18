"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useSignup } from "../Visualization/hooks/useAuth";
import { Spinner } from "../Spinner/Spinner";

import { ClaimUsernameStep } from "./ClaimUsername";

type Step = 1 | 2 | 3;

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const stepParam = Number(searchParams.get("step") ?? "1") as Step;
  const [step, setStep] = useState<Step>(stepParam);
  const [localError, setLocalError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [state, { signupWithEmail }] = useSignup();

  const firstNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const incoming = Number(searchParams.get("step") ?? "1") as Step;
    setStep(incoming);
  }, [searchParams]);

  useEffect(() => {
    if (step === 1) firstNameRef.current?.focus();
    if (step === 2) emailRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (state.data?.email) {
      router.push(`/check-mail?email=${encodeURIComponent(state.data.email)}`);
    }
  }, [state.data, router]);

  const goToStep = (s: Step) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(s));
    router.push(`?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    const { firstName, lastName } = formData;
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError("First and last name are required.");
      return;
    }
    setLocalError("");
    goToStep(2);
  };

  const handleToUsername = () => {
    const { email, password } = formData;
    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }
    setLocalError("");
    goToStep(3);
  };

  const handleClaim = (username: string) => {
    const { firstName, lastName, email, password } = formData;
    signupWithEmail(email, password, firstName, lastName, username);
  };

  const displayError =
    state.error === "unexpected"
      ? "An unexpected error occurred. Please try again."
      : localError;

  // Step 3 renders ClaimUsernameStep — no wrapper form needed
  if (step === 3) {
    return (
      <ClaimUsernameStep onSubmit={handleClaim} isLoading={state.loading} />
    );
  }

  return (
    <form
      onSubmit={
        step === 2
          ? e => {
              e.preventDefault();
              handleToUsername();
            }
          : e => e.preventDefault()
      }
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
            className="w-full rounded-3xl bg-[#0F0F0F] px-4 py-3.5 text-white font-medium text-sm font-body"
          >
            Continue
          </button>
        </>
      )}

      {displayError && <p className="text-error text-sm">{displayError}</p>}
    </form>
  );
}
