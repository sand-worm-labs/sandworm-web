"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_FORMSPREE_URL) return;

      const res = await fetch(process.env.NEXT_PUBLIC_FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Message sent successfully");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#ffffff30] flex flex-col gap-4 rounded-md md:w-[85%] p-1 mt-6 md:mt-0 w-full"
    >
      <div className="md:px-6 px-3 py-10  border-[#ffffff60] border rounded-lg  flex flex-col  justify-center w-full space-y-3">
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm text-white mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your Name"
            className="w-full rounded-md bg-dark-gray p-2 text-white focus:border-orange-500 focus:ring-orange-500 px-3 text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm text-white mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Your Email"
            className="w-full rounded-md bg-dark-gray p-2 text-white focus:border-orange-500 focus:ring-orange-500 px-3 text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="message" className="text-sm text-white mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Your Message"
            className="w-full bg-dark-gray p-2 text-white focus:border-orange-500 focus:ring-orange-500 px-3 min-h-[120px] text-sm rounded-md resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-[#ffffff60] px-4 py-3  font-medium disabled:opacity-90 mt-5 rounded-md flex items-center justify-center space-x-3  hover:bg-btnHover"
        >
          <Send size={18} />
          <p> {loading ? "Sending..." : "Submit"}</p>
        </button>
      </div>
    </form>
  );
};
