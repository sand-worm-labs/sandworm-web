"use client";

import { useState } from "react";

import { useSignup } from "../Visualization/hooks/useAuth";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [localError, setLocalError] = useState("");
  const [state, { signupWithEmail }] = useSignup();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const { firstName, lastName, email, password } = formData;
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setLocalError("All fields are required.");
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
      onSubmit={handleSubmit}
      className="mt-4 space-y-2 font-primary w-full"
    >
      {[
        { field: "firstName", label: "First Name", type: "text" },
        { field: "lastName", label: "Last Name", type: "text" },
        { field: "email", label: "Email", type: "email" },
        { field: "password", label: "Password", type: "password" },
      ].map(({ field, label, type }) => (
        <div key={field}>
          <input
            type={type}
            name={field}
            className="mt-1 w-full rounded-3xl dark:bg-[#121417] bg-[#FFFFFF] p-2.5 px-5 text-black dark:text-white border border-[#DEE2E6] dark:border-[#262A30] focus:border-[#A308F0] focus:ring-1 focus:ring-[#A308F0] outline-none font-normal text-[0.9rem] placeholder:text-muted-foreground dark:placeholder:text-ink-300 "
            placeholder={`${label}`}
            value={formData[field as keyof typeof formData]}
            onChange={handleChange}
          />
        </div>
      ))}

      {displayError && <p className="text-red-500 text-sm">{displayError}</p>}

      {state.data && (
        <p className="text-green-600 text-sm">
          Signup successful! Check your email: {state.data.email}
        </p>
      )}

      <button
        type="submit"
        disabled={state.loading}
        className="w-full rounded-3xl bg-[#0F0F0F] px-4 py-3.5 mb-5 text-white text-sm font-medium disabled:bg-[#868E96] text-sm"
      >
        {state.loading ? "Signing Up..." : "Sign Up"}
      </button>
    </form>
  );
}
