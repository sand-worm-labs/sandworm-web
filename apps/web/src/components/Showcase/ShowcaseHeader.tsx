"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { useSession } from "../Editor/hooks/useAuth";
import { SearchBar } from "../SearchBar";
import AccountMenu from "../Editor/PublicHeader/AccountMenu";
import HelpDropdown from "../Editor/PublicHeader/HelpDropdown";
import PublicHeaderLogo from "../Editor/PublicHeader/Logo";

// =====================================
// ⬢  Constants
// =====================================
const TABS = [
  { id: "showcase", label: "Showcase", href: "/showcase" },
  { id: "community", label: "Community", href: "/explore" },
  { id: "bounties", label: "Bounties", href: "/bounties" },
] as const;

// =====================================
// ⬢  Types
// =====================================
interface ShowcaseHeaderProps {
  active: (typeof TABS)[number]["id"];
}

// =====================================
// ⬢  ShowcaseHeader
// =====================================
export function ShowcaseHeader({ active }: ShowcaseHeaderProps) {
  const { user, loading, isAuthenticated } = useSession({
    redirectToLogin: false,
  });

  return (
    <header className="h-14 w-full shrink-0 flex items-center gap-3 sm:gap-5 px-3 sm:px-5 bg-base-100 dark:bg-header-surface font-body border-b border-border-secondary dark:border-border-tertiary">
      <PublicHeaderLogo isAuthenticated={isAuthenticated} />

      <nav className="flex items-center gap-1 h-full" aria-label="Sections">
        {TABS.map(tab => (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={tab.id === active ? "page" : undefined}
            className={cn(
              "h-full flex items-center px-2.5 text-sm border-b-2 -mb-px transition-colors",
              tab.id === active
                ? "border-primary text-ink-100 dark:text-white font-medium"
                : "border-transparent text-ink-400 hover:text-ink-100 dark:hover:text-white"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto min-w-0">
        <div className="hidden md:block">
          <SearchBar />
        </div>
        <HelpDropdown />
        <AccountMenu user={user} loading={loading} showName={false} />
      </div>
    </header>
  );
}
