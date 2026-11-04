import Link from "next/link";

import { AccountMenu } from "@/components/shell/AccountMenu";
import { TerminalBrand } from "@/components/TerminalBrand";
import type { HeaderAccount } from "@/features/auth/account";

import { SETUP_COMPLETE_PATH } from "../steps/routes";

export function SetupHeader({ account }: { account: HeaderAccount }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-secondary bg-header-surface px-6 md:px-10">
      <Link href="/" aria-label="Terminal home" className="flex items-center">
        <TerminalBrand />
      </Link>
      <div className="flex items-center gap-4">
        <AccountMenu
          user={account.user}
          workspaceName={account.workspaceName}
          showName
        />
        <Link
          href={SETUP_COMPLETE_PATH}
          className="font-medium text-primary-700 dark:text-primary-200 hover:text-primary"
        >
          Finish later
        </Link>
      </div>
    </header>
  );
}
