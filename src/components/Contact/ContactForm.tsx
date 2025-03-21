import React from "react";

export const ContactForm = () => {
  return (
    <form className="border border-[#ffffff30] p-6 py-12 flex flex-col gap-4 rounded-md md:w-[85%]">
      <input
        type="text"
        placeholder="Your Name"
        className="mt-1 w-full rounded-md bg-dark-gray p-2 text-white focus:border-orange-500 focus:ring-orange-500 px-3"
      />
      <input
        type="email"
        placeholder="Your Email"
        className="mt-1 w-full rounded-md bg-dark-gray p-2 text-white focus:border-orange-500 focus:ring-orange-500 px-3"
      />
      <textarea
        placeholder="Your Message"
        className="mt-1 w-full rounded-md bg-dark-gray p-2 text-white focus:border-orange-500 focus:ring-orange-500 px-3"
      />
      <button
        type="button"
        className="w-full rounded-md bg-orange-600 px-4 py-3 text-white font-medium disabled:bg-orange-300 mt-5"
      >
        Submit
      </button>
    </form>
  );
};
