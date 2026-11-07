"use client";

import { usePathname } from "next/navigation";
import {
  AccountMenu as SharedAccountMenu,
  SignInButton,
  type HeaderUser,
} from "@sandworm/ui/kit/app-header";

import { env } from "@/config/env";
import { signInUrl } from "@/lib/auth/sign-in";

async function signOut() {
  try {
    await fetch("/auth/signout", { method: "POST" });
  } catch (error) {
    console.error("[signout] failed:", error);
  }
  window.location.reload();
}

// The web app's account menu. Sign-in is on the main app, which sends the
// visitor back to this page.
type AccountMenuProps = {
  user: HeaderUser | null;
  workspaceName?: string | null;
  // The name beside the avatar. Off, the avatar alone opens the menu.
  showName?: boolean;
};

export function AccountMenu({
  user,
  workspaceName,
  showName = false,
}: AccountMenuProps) {
  const pathname = usePathname() ?? "/";

  return (
    <SharedAccountMenu
      user={user}
      showName={showName}
      signIn={<SignInButton href={signInUrl(pathname)} />}
      onSignOut={signOut}
      workspaceHref={`${env.webAppUrl}/workspace`}
      workspaceName={workspaceName}
    />
  );
}
