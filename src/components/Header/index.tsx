"use client";

import Link from "next/link";
import type { FC } from "react";

import type { CurrentUserProps } from "@/types";

import { SandwormLogo } from "../Assets/SandwormLogo";
import { DicebearAvatar } from "../DicebearAvatar";
import SearchBar from "../SearchBar.tsx";

const Header: FC<CurrentUserProps> = () => {
  return (
    <header className="px-8 py-2 flex justify-between border-b border-[#E2E8F0]">
      <Link href="/" className="flex items-center ">
        <SandwormLogo />
        <span className="ml-3 font-bold text-sm">SandWorm</span>
      </Link>
      <SearchBar />
      <DicebearAvatar size={40} seed="hello" />
    </header>
  );
};

export default Header;
