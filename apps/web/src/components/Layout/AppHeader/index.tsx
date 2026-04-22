"use client";

import { useState, type FC } from "react";
import { X, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { ThemeTogggle } from "@/components/Theme/ThemeToggle";

// =====================================
// ⬢ Constants
// =====================================
const ROUTE_TITLES: Record<string, string> = {
  "/": "Home",
  "/workspace": "Home",
  "/explore": "Explore",
  "/session": "Projects",
  "/favorites": "Favorites",
};

// =====================================
// ⬢ Utils
// =====================================
function getRouteTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];

  const segments = pathname.split("/").filter(Boolean);

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = `/${segments[i]}`;
    if (ROUTE_TITLES[segment]) return ROUTE_TITLES[segment];
  }
  return "Sandworm";
}

// =====================================
// ⬢ App Header
// =====================================
export const AppHeader: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const title = getRouteTitle(pathname);

  return (
    <header className="bg-[#FBFBFB] dark:bg-base-200 px-8 py-2 flex justify-between items-center border-[#E9ECEF] dark:border-border-tertiary">
      <div className="hidden md:flex items-center gap-4">
        <span className="text-base font-medium text-ink-400">{title}</span>
      </div>

      <div className="flex items-center lg:justify-normal justify-between w-full md:w-auto">
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
