import Link from "next/link";

import { SandwormLogo } from "@/components/Assets";
import { BetaBadge } from "@/components/BetaBadge";

interface PublicHeaderLogoProps {
  isAuthenticated?: boolean;
}

// Signed-in users land on their workspace home; signed-out visitors go to the
// marketing home page (not "/", which just redirects to /explore).
const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || "/";

export default function PublicHeaderLogo({
  isAuthenticated = false,
}: PublicHeaderLogoProps) {
  return (
    <Link
      href={isAuthenticated ? "/workspace" : LANDING_URL}
      aria-label="Sandworm home"
      className="flex items-center gap-2 shrink-0"
    >
      <SandwormLogo width="26" height="26" />
      <span className="hidden sm:inline font-bold text-[0.95rem] uppercase font-tertiary text-ink-100 dark:text-white">
        SandWorm
      </span>
      <BetaBadge />
    </Link>
  );
}
