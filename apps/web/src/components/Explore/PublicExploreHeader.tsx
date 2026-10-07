"use client";

import { useSession } from "../Editor/hooks/useAuth";
import AccountMenu from "../Editor/PublicHeader/AccountMenu";
import HelpDropdown from "../Editor/PublicHeader/HelpDropdown";
import PublicHeaderLogo from "../Editor/PublicHeader/Logo";

export function PublicExploreHeader() {
  const { user, loading, isAuthenticated } = useSession({
    redirectToLogin: false,
  });

  return (
    <div className="w-full bg-base-100 font-body relative">
      <div className="h-14 w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-5 border-b border-border-secondary dark:border-border-tertiary">
        <PublicHeaderLogo isAuthenticated={isAuthenticated} />

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <HelpDropdown />
          <AccountMenu user={user} loading={loading} />
        </div>
      </div>
    </div>
  );
}
