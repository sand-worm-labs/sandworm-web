"use client";

import { usePathname } from "next/navigation";

import { AppFooter } from "@/components/Layout/AppFooter";

export const FooterWrapper = () => {
  const pathname = usePathname();
  const hideFooterOnPath = "/console";

  if (pathname === hideFooterOnPath) {
    return null;
  }

  return <AppFooter />;
};
