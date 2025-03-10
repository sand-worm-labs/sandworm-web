"use client";

import { useState } from "react";

import { signUpWithEmail } from "@/services/firebase/auth";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { name, email, password } = formData;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    setIsLoading(true);
    const success = await signUpWithEmail(email.trim(), password.trim());

    if (!success) setError("Failed to create an account. Please try again.");
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {["name", "email", "password"].map(field => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-300">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            type={field === "password" ? "password" : "text"}
            name={field}
            className="mt-1 w-full rounded-md bg-[#1A1A1A] p-2 text-white focus:border-orange-500 focus:ring-orange-500"
            placeholder={`Enter your ${field}`}
            value={formData[field as keyof typeof formData]}
            onChange={handleChange}
          />
        </div>
      ))}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-orange-600 px-4 py-2 text-white font-medium disabled:bg-orange-300"
      >
        {isLoading ? "Signing Up..." : "Sign Up"}
      </button>
    </form>
  );
}
