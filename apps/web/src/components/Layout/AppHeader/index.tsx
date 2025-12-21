"use client";

import { useState, type FC } from "react";
import { X, Search } from "lucide-react";

import { ThemeTogggle } from "@/components/Theme/ThemeToggle";

import { SearchBar } from "../../SearchBar";

export const AppHeader: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-background px-8 py-2 flex justify-between items-center border-b border-[#E9ECEF] dark:border-[#262A30] ">
      <span className="text-lg font-medium">Home</span>
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

        <ThemeTogggle />
      </div>
    </header>
  );
};
