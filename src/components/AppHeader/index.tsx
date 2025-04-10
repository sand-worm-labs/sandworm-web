"use client";

import Link from "next/link";
import type { FC } from "react";
import { useSession } from "next-auth/react";

import { SandwormLogo } from "../Assets/SandwormLogo";
import SearchBar from "../SearchBar";
import { ProfileMenu } from "../ProfileMenu";
import { CreateQueryButton } from "./CreateQueryButton";

const AppHeader: FC = () => {
  const { data: session } = useSession();

  return (
    <header className="px-8 py-2 flex justify-between items-center">
      <Link href="/" className="flex items-center">
        <SandwormLogo />
        <span className="ml-3 font-medium text-xl uppercase">SandW0rm.</span>
      </Link>
      <SearchBar />
      {session?.user ? (
        <ProfileMenu currentUser={{ ...session.user }} />
      ) : (
        <Link
          href="/sign-in"
          className="border py-1.5 bg-white text-black rounded px-4 text-[0.9rem] font-medium hover:bg-white/85"
        >
          Sign In
        </Link>
      )}
    </header>
  );
};

export default AppHeader;
