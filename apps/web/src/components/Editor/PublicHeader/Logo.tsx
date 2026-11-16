import Link from "next/link";
import { HeaderBrand } from "@sandworm/ui/kit/app-header";

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
      className="flex items-center shrink-0"
    >
      <HeaderBrand
        mark={<SandwormLogo width="26" height="26" />}
        badges={<BetaBadge />}
      />
    </Link>
  );
}
