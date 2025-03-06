"use client";

import Link from "next/link";
import type { FC } from "react";

import type { CurrentUserProps } from "@/types";

import { SandwormLogo } from "../Assets/SandwormLogo";
import SearchBar from "../SearchBar";
import { ProfileMenu } from "../ProfileMenu";

const AppHeader: FC<CurrentUserProps> = ({ currentUser }) => {
  return (
    <header className="px-8 py-3 flex justify-between items-center ">
      <Link href="/" className="flex items-center ">
        <SandwormLogo />
        <span className="ml-3 font-medium text-xl uppercase ">SandW0rm.</span>
      </Link>
      <SearchBar />
      {currentUser ? (
        <ProfileMenu currentUser={currentUser} />
      ) : (
        <Link
          href="/sign-in"
          className="border py-1.5 bg-white text-black rounded px-4 text-[0.9rem] font-medium"
        >
          Sign In
        </Link>
      )}
    </header>
  );
};

export default AppHeader;
