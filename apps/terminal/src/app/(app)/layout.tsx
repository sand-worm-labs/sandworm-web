import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { getAccess } from "@/features/access/source";
import { signInUrl } from "@/features/auth/sign-in";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const access = await getAccess();

  if (access._tag === "signedOut") redirect(signInUrl("/"));
  if (access._tag === "noClient") redirect("/access");

  return <AppShell>{children}</AppShell>;
}
