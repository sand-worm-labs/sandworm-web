import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/AppShell";
import { getAccess } from "@/features/access/source";
import { RequestAccessScreen } from "@/features/access/RequestAccessScreen";
import { signInUrl } from "@/features/auth/sign-in";

export default async function AccessRoute() {
  const access = await getAccess();

  if (access._tag === "allowed") redirect("/");
  if (access._tag === "signedOut") redirect(signInUrl("/access"));

  return (
    <AppShell>
      <RequestAccessScreen email={access.email} />
    </AppShell>
  );
}
