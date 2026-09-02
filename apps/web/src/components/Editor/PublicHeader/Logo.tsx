import Link from "next/link";

import { SandwormLogo } from "@/components/Assets";

export default function PublicHeaderLogo() {
  return (
    <Link
      href="/"
      aria-label="Sandworm home"
      className="flex items-center gap-2 shrink-0"
    >
      <SandwormLogo width="26" height="26" />
      <span className="hidden sm:inline font-bold text-[0.95rem] uppercase font-tertiary text-ink-100 dark:text-white">
        SandWorm
      </span>
    </Link>
  );
}
