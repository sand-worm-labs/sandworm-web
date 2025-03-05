"use client";

import Link from "next/link";
import type { FC } from "react";

import type { CurrentUserProps } from "@/types";

import { SandwormLogo } from "../Assets/SandwormLogo";
import SearchBar from "../SearchBar.tsx";
import { ProfileMenu } from "../ProfileMenu";

const Header: FC<CurrentUserProps> = ({ currentUser }) => {
  return (
    <header className="px-8 py-4 flex justify-between items-center ">
      <Link href="/" className="flex items-center ">
        <SandwormLogo />
        <span className="ml-3 font-bold text-sm">SandWorm</span>
      </Link>
      <SearchBar />
      {currentUser ? (
        <ProfileMenu currentUser={currentUser} />
      ) : (
        <Link
          href="/sign-in"
          className="bg-orange-500 px-4 py-2 text-white rounded-md"
        >
          Sign In
        </Link>
      )}
    </header>
  );
};

export default Header;
