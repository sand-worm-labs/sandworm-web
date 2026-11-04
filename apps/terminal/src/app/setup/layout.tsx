import type { ReactNode } from "react";

import { getSession } from "@/features/session/source";
import { SetupProvider } from "@/features/setup/context";
import { loadSetupDraft } from "@/features/setup/source";

export default async function SetupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [session, initialDraft] = await Promise.all([
    getSession(),
    loadSetupDraft(),
  ]);

  return (
    <SetupProvider session={session} initialDraft={initialDraft}>
      {children}
    </SetupProvider>
  );
}
