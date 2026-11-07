import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import { signInUrl } from "@/lib/auth/sign-in";
import { getTeamAccess } from "@/lib/team/access";
import { TEAM_CLIENTS_PATH } from "@/lib/team/routes";

// The Sandworm team's tools. The API checks staff on every call; this keeps
// everyone else from seeing the screens at all.
export default async function TeamLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getTeamAccess();

  if (access === "signedOut") redirect(signInUrl(TEAM_CLIENTS_PATH));
  if (access === "notStaff") notFound();

  return children;
}
