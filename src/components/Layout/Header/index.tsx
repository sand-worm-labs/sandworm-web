"use client";

import Link from "next/link";
import { useState } from "react";

import { SandwormLogo } from "@/components/Assets";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { name: "Explore", href: "/explore" },
  { name: "Docs", href: "https://docs.sandwormlabs.xyz", isExternal: true },
  {
    name: "Blog",
    href: "https://docs.sandwormlabs.xyz/blog",
    isExternal: true,
  },
];

export const MainHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b border-borderLight">
      <div className="px-8 flex justify-between items-center py-3">
        <div className="flex">
          <Link href="/" className="flex items-center">
            <SandwormLogo />
            <span className="ml-3 font-medium text-xl uppercase">
              Sandw0rm.
            </span>
            <Badge className="bg-white/15 rounded-lg ml-2">beta</Badge>
          </Link>
          <ul className="hidden md:flex ml-10 text-[0.9rem] items-center space-x-8">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  {...(link.isExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-[#999999] hover:text-white"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link
          className="hidden md:flex border py-1.5 bg-white text-black rounded px-4 text-[0.9rem] font-medium"
          href="/workspace"
        >
          <span>Launch App</span>
        </Link>

        <button
          type="button"
          className="md:hidden flex flex-col space-y-1 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div
            className={`w-6 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
              isOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <div
            className={`w-6 h-0.5 bg-white transition-opacity duration-300 ease-in-out ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <div
            className={`w-6 h-0.5 bg-white transition-transform duration-300 ease-in-out ${
              isOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden flex flex-col items-center space-y-4 py-4 bg-black border-t border-borderLight h-[90vh] fixed w-full z-10 bottom-0">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              {...(link.isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="text-[#999999] hover:text-white text-[0.9rem]"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/explore"
            className="border py-1.5 bg-white text-black rounded px-4 text-[0.9rem] font-medium"
            onClick={() => setIsOpen(false)}
          >
            Launch App
          </Link>
        </div>
      )}
    </header>
  );
};
