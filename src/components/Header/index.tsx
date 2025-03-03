"use client";

import Link from "next/link";
import type { FC } from "react";
import { useRouter } from "next/navigation";

import type { CurrentUserProps } from "@/types";
import { signOut } from "@/services/firebase/auth";

import { SandwormLogo } from "../Assets/SandwormLogo";
import { DicebearAvatar } from "../DicebearAvatar";
import SearchBar from "../SearchBar.tsx";

const Header: FC<CurrentUserProps> = ({ currentUser }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    const isOk = await signOut();

    if (isOk) router.push("/sign-in");
  };

  return (
    <header className="px-8 py-4 flex justify-between items-center ">
      <Link href="/" className="flex items-center ">
        <SandwormLogo />
        <span className="ml-3 font-bold text-sm">SandWorm</span>
      </Link>
      <SearchBar />
      {currentUser ? (
        <div className="flex items-center space-x-3">
          <p>{currentUser.displayName}</p>
          <DicebearAvatar size={40} seed="hello" />
          <button type="button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
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
