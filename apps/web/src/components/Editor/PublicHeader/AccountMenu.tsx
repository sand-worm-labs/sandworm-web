"use client";

import Link from "next/link";
import { PiArrowSquareOut, PiSignOut } from "react-icons/pi";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@sandworm/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@sandworm/ui/components/dropdown-menu";

import type { ApiUser } from "@/types";
import { useModalStore } from "@/store/auth";

import { useSignout } from "../hooks/useAuth";

interface AccountMenuProps {
  user: ApiUser | null;
  loading: boolean;
}

function UserAvatar({ user, className }: { user: ApiUser; className: string }) {
  const initial =
    user.firstName?.[0]?.toUpperCase() ??
    user.username?.[0]?.toUpperCase() ??
    "U";

  return (
    <Avatar className={className}>
      <AvatarImage
        src={user.avater ?? undefined}
        alt={user.firstName ?? user.username ?? "User"}
      />
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}

export default function AccountMenu({ user, loading }: AccountMenuProps) {
  const signout = useSignout();
  const openSignIn = useModalStore(state => state.openSignIn);

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-base-200 dark:bg-base-600 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openSignIn()}
        className="px-3.5 py-1.5 rounded-md border border-border-secondary dark:border-border-tertiary text-sm font-medium text-ink-100 dark:text-white hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors"
      >
        Sign in
      </button>
    );
  }

  const displayName = user.firstName ?? user.username ?? "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-transparent hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors"
        >
          <UserAvatar user={user} className="h-7 w-7" />
          <span className="hidden sm:inline text-sm font-medium text-ink-100 dark:text-white max-w-[120px] truncate">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-2xl border border-border-secondary dark:border-border-tertiary dark:bg-dropdown-bg shadow-md p-2"
        align="end"
      >
        <div className="flex items-center gap-3 px-2 py-2 mb-1 border-b border-border-secondary dark:border-border-tertiary">
          <UserAvatar user={user} className="h-9 w-9" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-100 dark:text-white truncate">
              {displayName} {user.lastName ?? ""}
            </p>
            {user.email && (
              <p className="text-xs text-ink-400 truncate">{user.email}</p>
            )}
          </div>
        </div>

        <Link
          href="/workspace"
          className="flex items-center gap-3 w-full px-3 py-1.5 rounded-[10px] border border-transparent text-sm font-medium text-ink-500 dark:text-white hover:bg-hover-bg hover:border-hover-border dark:hover:bg-dropdown-hover transition-colors"
        >
          <PiArrowSquareOut
            size={16}
            className="text-ink-navy dark:text-placeholder-muted"
          />
          Open Workspace
        </Link>

        <DropdownMenuSeparator className="my-1 dark:bg-editor-200" />

        <button
          type="button"
          onClick={signout}
          className="flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-error transition-colors"
        >
          <PiSignOut size={18} />
          Sign Out
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
