"use client";

import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { findRouteByPath } from "@/config/routes";

import { HeaderSearch } from "./HeaderSearch";

export function AppHeader() {
  const title = findRouteByPath(usePathname())?.label ?? "Terminal";

  return (
    <header className="flex items-center justify-between border-b border-border-secondary bg-header-surface px-8 py-[5.3px] dark:border-border-tertiary">
      <span className="hidden text-sm font-medium text-ink-400 dark:text-ink-100 md:block">
        {title}
      </span>
      <div className="ml-auto flex items-center">
        <div className="mr-3 hidden md:block">
          <HeaderSearch />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
