import type { ReactNode } from "react";

import { getHeaderAccount } from "@/features/auth/account";
import { getSession } from "@/features/session/source";
import { SetupProvider } from "@/features/setup/context";
import { loadSetupDraft } from "@/features/setup/source";

export default async function SetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [session, initialDraft, account] = await Promise.all([
    getSession(),
    loadSetupDraft(),
    getHeaderAccount(),
  ]);

  return (
    <SetupProvider
      session={session}
      initialDraft={initialDraft}
      account={account}
    >
      {children}
    </SetupProvider>
  );
}
