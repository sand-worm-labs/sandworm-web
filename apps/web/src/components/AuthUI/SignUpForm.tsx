"use client";

import { useState } from "react";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
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

    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 font-primary w-full"
    >
      {["email", "password"].map(field => (
        <div key={field}>
          <label className="block text-sm font-medium dark:text-gray-300 text-[#1A1A1A]">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            type={field === "password" ? "password" : "text"}
            name={field}
            className="mt-1 w-full rounded-md dark:bg-[#1A1A1A] bg-[#F1F3F4] p-2 text-black dark:text-white focus:border-orange-500 focus:ring-orange-500 border border-[#DEE2E6] font-normal text-[0.9rem] placeholder:text-[#455768]"
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
        className="w-full rounded-xl bg-[#C7665C] px-4 py-3 mb-5 text-white text-sm font-medium disabled:bg-orange-300 inline-block"
      >
        {isLoading ? "Signing Up..." : "Sign Up"}
      </button>
    </form>
  );
}
