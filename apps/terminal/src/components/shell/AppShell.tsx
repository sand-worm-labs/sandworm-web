import clsx from "clsx";

import type { HeaderAccount } from "@/lib/auth/account";
import type { ChildrenProps, SectionCounts } from "@/types";

import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";

type AppShellProps = ChildrenProps & {
  account: HeaderAccount;
  // The client sections' counts. Pages outside those sections leave it out and get no tab bar.
  counts?: SectionCounts;
};

export function AppShell({ account, counts, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-page-surface font-body text-[13px] leading-[1.45] text-ink-100">
      <div className="sticky top-0 z-30 md:static">
        <AppHeader account={account} />
      </div>
      <main
        className={clsx(
          "mx-auto w-full max-w-[1168px] flex-1 px-4 pt-5 md:px-10 md:pb-16 md:pt-8",
          counts ? "pb-[calc(5rem+env(safe-area-inset-bottom))]" : "pb-16"
        )}
      >
        {children}
      </main>
      {counts && <BottomNav counts={counts} />}
    </div>
  );
}
