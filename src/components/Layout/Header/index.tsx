"use client";

import Link from "next/link";
import { useState } from "react";

import { SandwormLogo } from "@/components/Assets";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { name: "Explore", href: "workspace/explore" },
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
    <header className="  fixed w-full top-5  mx-auto left-0 right-0 z-[99]">
      <div className="w-[60%] mx-auto bg-[#FF887A] dark:bg-[#000000] rounded-xl">
        <div className="px-3 flex justify-between items-center py-2.5">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <SandwormLogo />
              <span className="ml-3 font-medium text-xl uppercase">
                Sandw0rm.
              </span>
              <Badge className="bg-white text-black dark:text-white rounded-xl ml-2 font-normal">
                beta
              </Badge>
            </Link>
            <ul className="hidden md:flex ml-10 text-[0.8rem] items-center space-x-8">
              {navLinks.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    {...(link.isExternal
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="dark:text-[#999999] text-[#000000] font-bold uppercase  hover:text-[#C7665C]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            className="hidden md:flex border py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl px-4 text-[0.9rem] font-medium"
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
          <div className="md:hidden flex flex-col items-center space-y-4 py-4 bg-black border-t border-borderLight bottom-0">
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
              href="workspace/explore"
              className="border py-1.5 bg-white text-black rounded px-4 text-[0.9rem] font-medium"
              onClick={() => setIsOpen(false)}
            >
              Launch App
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
