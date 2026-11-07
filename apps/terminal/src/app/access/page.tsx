import { redirect } from "next/navigation";

import { AppShell } from "@/components/Shell/AppShell";
import { getAccess } from "@/lib/access/source";
import { RequestAccessScreen } from "@/components/Access/RequestAccessScreen";
import { getHeaderAccount } from "@/lib/auth/account";
import { signInUrl } from "@/lib/auth/sign-in";

export default async function AccessRoute() {
  const access = await getAccess();

  if (access._tag === "allowed") redirect("/");
  if (access._tag === "signedOut") redirect(signInUrl("/access"));

  const account = await getHeaderAccount();

  return (
    <AppShell account={account}>
      <RequestAccessScreen email={access.email} />
    </AppShell>
  );
}
