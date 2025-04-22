import { Toaster } from "sonner";

import { FooterWrapper } from "@/components/Layout/AppFooter/FooterWrapper";
import { AppHeader } from "@/components/Layout/AppHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
      <FooterWrapper />
      <Toaster />
    </>
  );
}
