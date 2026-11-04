"use client";

import { usePathname } from "next/navigation";
import {
  AccountMenu as SharedAccountMenu,
  SignInButton,
  type HeaderUser,
} from "@sandworm/ui/kit/app-header";

import { env } from "@/config/env";
import { signInUrl } from "@/features/auth/sign-in";

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
export function AccountMenu({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname() ?? "/";

  return (
    <SharedAccountMenu
      user={user}
      showName={false}
      signIn={<SignInButton href={signInUrl(pathname)} />}
      onSignOut={signOut}
      workspaceHref={`${env.webAppUrl}/workspace`}
    />
  );
}
