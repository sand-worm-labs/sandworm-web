"use client";

import type { ReactNode } from "react";
import {
  PiArrowSquareOut,
  PiBookOpen,
  PiGithubLogo,
  PiInfo,
  PiSignOut,
} from "react-icons/pi";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@sandworm/ui/components/dropdown-menu";
import { UserAvatar } from "@sandworm/ui/kit/user-avatar";
import { cn } from "@sandworm/ui/lib/utils";

// The header shared by every Sandworm app (web, terminal). Apps pass their
// own data and links; the look lives here so the two never drift apart.
// Apps that use this must let Tailwind scan packages/ui/src (see kit/README).

// =====================================
// ⬢  Frame
// =====================================
export function AppHeaderFrame({ children }: { children: ReactNode }) {
  return (
    <header className="h-14 w-full shrink-0 flex items-center gap-3 sm:gap-5 px-3 sm:px-5 bg-base-100 dark:bg-header-surface font-body border-b border-border-secondary dark:border-border-tertiary">
      {children}
    </header>
  );
}

export function AppHeaderActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 ml-auto min-w-0">{children}</div>
  );
}

// =====================================
// ⬢  Brand
// =====================================
export function HeaderBadge({ children }: { children: ReactNode }) {
  return (
    <span className="px-2 py-0.5 rounded-lg border border-[var(--beta-badge-border)] text-[0.6rem] lg:text-xs font-tertiary bg-[var(--beta-badge-bg)] text-[var(--beta-badge-text)]">
      {children}
    </span>
  );
}

// Logo, wordmark and badges. The app wraps it in its own link.
export function HeaderBrand({
  mark,
  badges,
}: {
  mark: ReactNode;
  badges?: ReactNode;
}) {
  return (
    <span className="flex items-center gap-2 shrink-0">
      {mark}
      <span className="hidden sm:inline font-bold text-[0.95rem] uppercase font-tertiary text-ink-100 dark:text-white">
        SandWorm
      </span>
      {badges}
    </span>
  );
}

// =====================================
// ⬢  Help menu
// =====================================
const MENU_CLASS =
  "rounded-2xl border border-border-secondary dark:border-border-tertiary dark:bg-dropdown-bg shadow-md p-2";

const ITEM_CLASS =
  "flex items-center gap-3 w-full px-3 py-1.5 rounded-[10px] border border-transparent text-sm font-medium text-ink-500 dark:text-white hover:bg-hover-bg hover:border-hover-border dark:hover:bg-dropdown-hover transition-colors";

const ICON_CLASS = "text-ink-navy dark:text-placeholder-muted";

export function HelpMenu({
  docsUrl,
  githubUrl,
}: {
  docsUrl: string;
  githubUrl: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Help and resources"
          className="flex items-center justify-center h-8 w-8 rounded-[10px] border border-transparent text-ink-400 hover:text-ink-100 dark:hover:text-white hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors"
        >
          <PiInfo size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-48", MENU_CLASS)} align="end">
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={ITEM_CLASS}
        >
          <PiBookOpen size={16} className={ICON_CLASS} />
          Documentation
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={ITEM_CLASS}
        >
          <PiGithubLogo size={16} className={ICON_CLASS} />
          GitHub
        </a>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =====================================
// ⬢  Account menu
// =====================================
export type HeaderUser = {
  // Short name: shown beside the avatar and as its initial.
  name: string;
  // Full name for the menu's heading.
  fullName?: string;
  email?: string | null;
  avatarUrl?: string | null;
};

const SIGN_IN_CLASS =
  "px-3 sm:px-3.5 py-1.5 whitespace-nowrap rounded-md border border-border-secondary dark:border-border-tertiary text-sm font-medium text-ink-100 dark:text-white hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors";

// A button when the app opens its own sign-in (web's modal), a link when
// sign-in is on another page or app (terminal).
export function SignInButton(
  props:
    | { onClick: () => void; href?: never }
    | { href: string; onClick?: never }
) {
  if (props.href !== undefined) {
    return (
      <a href={props.href} className={SIGN_IN_CLASS}>
        Sign in
      </a>
    );
  }
  return (
    <button type="button" onClick={props.onClick} className={SIGN_IN_CLASS}>
      Sign in
    </button>
  );
}

export function AccountMenu({
  user,
  loading = false,
  showName = true,
  signIn,
  onSignOut,
  workspaceHref,
}: {
  user: HeaderUser | null;
  loading?: boolean;
  // The name beside the avatar. Off, the avatar alone opens the menu.
  showName?: boolean;
  signIn: ReactNode;
  onSignOut: () => void;
  workspaceHref: string;
}) {
  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-base-200 dark:bg-base-600 animate-pulse" />
    );
  }

  if (!user) return <>{signIn}</>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={showName ? undefined : "Account menu"}
          className={cn(
            "flex items-center gap-2 pl-1 py-1 rounded-full border border-transparent hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors",
            showName ? "pr-2.5" : "pr-1"
          )}
        >
          <UserAvatar name={user.name} src={user.avatarUrl ?? undefined} />
          {showName && (
            <span className="hidden sm:inline text-sm font-medium text-ink-100 dark:text-white max-w-[120px] truncate">
              {user.name}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-56", MENU_CLASS)} align="end">
        <div className="flex items-center gap-3 px-2 py-2 mb-1 border-b border-border-secondary dark:border-border-tertiary">
          <UserAvatar
            name={user.name}
            src={user.avatarUrl ?? undefined}
            size="md"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-100 dark:text-white truncate">
              {user.fullName ?? user.name}
            </p>
            {user.email && (
              <p className="text-xs text-ink-400 truncate">{user.email}</p>
            )}
          </div>
        </div>

        <a href={workspaceHref} className={ITEM_CLASS}>
          <PiArrowSquareOut size={16} className={ICON_CLASS} />
          Open Workspace
        </a>

        <DropdownMenuSeparator className="my-1 dark:bg-editor-200" />

        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-error transition-colors"
        >
          <PiSignOut size={18} />
          Sign Out
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
