import { getHeaderAccount } from "@/lib/auth/account";
import { getSession } from "@/lib/session/source";
import { SetupProvider } from "@/providers/SetupProvider";
import { loadSetupDraft } from "@/lib/setup/source";
import type { ChildrenProps } from "@/types";

export default async function SetupLayout({ children }: ChildrenProps) {
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
