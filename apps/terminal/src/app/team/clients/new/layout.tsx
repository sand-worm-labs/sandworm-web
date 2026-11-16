import { getHeaderAccount } from "@/lib/auth/account";
import { TeamClientProvider } from "@/providers/TeamProvider";
import { getStarterResearch } from "@/lib/team/source";
import type { ChildrenProps } from "@/types";

export default async function NewClientLayout({ children }: ChildrenProps) {
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
