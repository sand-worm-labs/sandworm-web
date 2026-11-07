import type { ReactNode } from "react";

import { getHeaderAccount } from "@/lib/auth/account";
import { TeamClientProvider } from "@/providers/TeamProvider";
import { getStarterResearch } from "@/lib/team/source";

export default async function NewClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [catalogue, account] = await Promise.all([
    getStarterResearch(),
    getHeaderAccount(),
  ]);

  return (
    <TeamClientProvider catalogue={catalogue} account={account}>
      {children}
    </TeamClientProvider>
  );
}
