import type { ReactNode } from "react";

import { getHeaderAccount } from "@/features/auth/account";
import { TeamClientProvider } from "@/features/team/context";
import { getStarterResearch } from "@/features/team/source";

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
