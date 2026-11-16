import Image from "next/image";
import { HeaderBadge, HeaderBrand } from "@sandworm/ui/kit/app-header";

// The web app's logo with a "terminal" badge: the only difference between
// the two headers.
export function TerminalBrand() {
  return (
    <HeaderBrand
      mark={<Image src="/logo.svg" alt="" width={26} height={26} />}
      badges={<HeaderBadge>terminal</HeaderBadge>}
    />
  );
}
