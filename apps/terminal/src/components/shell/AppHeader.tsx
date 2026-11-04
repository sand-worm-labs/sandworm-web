import Link from "next/link";

import { BrandBadge } from "@/components/BrandBadge";
import { BrandMark } from "@/components/BrandMark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ROUTES } from "@/config/routes";

import { HeaderSearch } from "./HeaderSearch";

// Same frame as the web app's header (ShowcaseHeader): logo and badge on the
// left, search and controls on the right, 56px tall.
export function AppHeader() {
  return (
    <header className="flex h-14 w-full shrink-0 items-center gap-3 border-b border-border-secondary bg-base-100 px-3 font-body sm:gap-5 sm:px-5 dark:border-border-tertiary dark:bg-header-surface">
      <Link
        href={ROUTES.overview.path}
        aria-label="Terminal home"
        className="flex shrink-0 items-center gap-2"
      >
        <BrandMark />
        <BrandBadge>terminal</BrandBadge>
      </Link>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <div className="hidden md:block">
          <HeaderSearch />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
