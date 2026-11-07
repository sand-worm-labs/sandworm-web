import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/Shell/AppShell";
import { getAccess } from "@/features/access/source";
import { getHeaderAccount } from "@/features/auth/account";
import { signInUrl } from "@/features/auth/sign-in";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const access = await getAccess();

  if (access._tag === "signedOut") redirect(signInUrl("/"));
  if (access._tag === "noClient") redirect("/access");

  const account = await getHeaderAccount();

  return <AppShell account={account}>{children}</AppShell>;
}
