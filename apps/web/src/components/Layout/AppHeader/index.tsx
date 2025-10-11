"use client";

import Link from "next/link";
import { useState, type FC } from "react";
import { useSession } from "next-auth/react";
import { X, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SandwormLogo } from "@/components/Assets";

import { ProfileMenu } from "../../ProfileMenu";
import { SearchBar } from "../../SearchBar";

export const AppHeader: FC = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="px-8 py-2 flex justify-between items-center border-b border">
      <Link href="/" className="flex items-center">
        <SandwormLogo />
        <span className="ml-3 font-semibold text-lg uppercase hidden md:inline-block">
          SandW0rm.
        </span>
        <Badge className="">
          beta
        </Badge>
      </Link>

      <div className="hidden md:block">
        <SearchBar />
      </div>

      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="mr-1.5 md:hidden"
        >
          {menuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>

        {session?.user ? (
          <ProfileMenu currentUser={{ ...session.user }} />
        ) : null}
      </div>
    </header>
  );
};
