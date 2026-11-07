import Link from "next/link";

import { AccountMenu } from "@/components/Shell/AccountMenu";
import { TerminalBrand } from "@/components/TerminalBrand";
import type { HeaderAccount } from "@/features/auth/account";
import { SETUP_COMPLETE_PATH } from "@/features/setup/steps/routes";

type SetupHeaderProps = {
  account: HeaderAccount;
  exit?: { label: string; href: string };
};

export function SetupHeader({
  account,
  exit = { label: "Finish later", href: SETUP_COMPLETE_PATH },
}: SetupHeaderProps) {
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
          href={exit.href}
          className="font-medium text-primary-700 dark:text-primary-200 hover:text-primary"
        >
          {exit.label}
        </Link>
      </div>
    </header>
  );
}
