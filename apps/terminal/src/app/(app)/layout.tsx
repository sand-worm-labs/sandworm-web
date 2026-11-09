import { redirect } from "next/navigation";

import { AppShell } from "@/components/Shell/AppShell";
import { getAccess } from "@/lib/access/source";
import { getHeaderAccount } from "@/lib/auth/account";
import { signInUrl } from "@/lib/auth/sign-in";
import { getPreview } from "@/lib/preview/cookies";
import { ApiProvider } from "@/providers/ApiProvider";
import { PreviewProvider } from "@/providers/PreviewProvider";
import type { ChildrenProps } from "@/types";

export default async function AppLayout({ children }: ChildrenProps) {
  const access = await getAccess();

  if (access._tag === "signedOut") redirect(signInUrl("/"));
  if (access._tag === "noClient") redirect("/access");

  const [account, preview] = await Promise.all([
    getHeaderAccount(),
    getPreview(),
  ]);

  return (
    <ApiProvider>
      <PreviewProvider preview={preview}>
        <AppShell account={account}>{children}</AppShell>
      </PreviewProvider>
    </ApiProvider>
  );
}
