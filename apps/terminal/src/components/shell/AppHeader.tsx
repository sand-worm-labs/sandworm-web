import Link from "next/link";
import {
  AppHeaderActions,
  AppHeaderFrame,
  HelpMenu,
} from "@sandworm/ui/kit/app-header";

import { TerminalBrand } from "@/components/TerminalBrand";
import { ThemeToggle } from "@/components/Theme/ThemeToggle";
import { ROUTES } from "@/config/routes";
import type { HeaderAccount } from "@/lib/auth/account";

import { AccountMenu } from "./AccountMenu";
import { HeaderSearch } from "./HeaderSearch";

const DOCS_URL = "https://docs.sandwormlab.xyz";
const GITHUB_URL = "https://github.com/sand-worm-labs";

// The web app's header (ShowcaseHeader), built from the same shared pieces.
// The only difference is the "terminal" badge.
export function AppHeader({ account }: { account: HeaderAccount }) {
  const { user, workspaceName } = account;

  return (
    <AppHeaderFrame>
      <Link
        href={ROUTES.overview.path}
        aria-label="Terminal home"
        className="flex items-center shrink-0"
      >
        <TerminalBrand />
      </Link>

      <AppHeaderActions>
        <div className="hidden md:block">
          <HeaderSearch />
        </div>
        <div className="hidden md:block">
          <HelpMenu docsUrl={DOCS_URL} githubUrl={GITHUB_URL} />
        </div>
        <ThemeToggle />
        <AccountMenu user={user} workspaceName={workspaceName} />
      </AppHeaderActions>
    </AppHeaderFrame>
  );
}
