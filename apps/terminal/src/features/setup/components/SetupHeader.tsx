import Link from "next/link";

import { TerminalBrand } from "@/components/TerminalBrand";
import type { Session } from "@/features/session/types";

import { SETUP_COMPLETE_PATH } from "../steps/routes";

export function SetupHeader({ session }: { session: Session }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-secondary bg-header-surface px-6 md:px-10">
      <Link href="/" aria-label="Terminal home" className="flex items-center">
        <TerminalBrand />
      </Link>
      <div className="flex items-center gap-4">
        <span className="hidden text-ink-400 sm:inline">
          {session.client.name} · {session.user.name}
        </span>
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
