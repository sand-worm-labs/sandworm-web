import type { HeaderAccount } from "@/lib/auth/account";
import type { ChildrenProps } from "@/types";

import { AppHeader } from "./AppHeader";

type AppShellProps = ChildrenProps & { account: HeaderAccount };

export function AppShell({ account, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-page-surface font-body text-[13px] leading-[1.45] text-ink-100">
      <AppHeader account={account} />
      <main className="mx-auto w-full max-w-[1168px] flex-1 px-6 pb-16 pt-8 md:px-10">
        {children}
      </main>
    </div>
  );
}
