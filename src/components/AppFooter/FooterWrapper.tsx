"use client";

import { usePathname } from "next/navigation";
import AppFooter from ".";

export default function FooterWrapper() {
  const pathname = usePathname();
  const hideFooterOnPath = "/workspace";

  if (pathname === hideFooterOnPath) {
    return null;
  }

  return <AppFooter />;
}
