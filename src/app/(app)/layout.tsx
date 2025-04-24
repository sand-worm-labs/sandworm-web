import { Toaster } from "sonner";

import { FooterWrapper } from "@/components/Layout/AppFooter/FooterWrapper";
import { AppHeader } from "@/components/Layout/AppHeader";
import { SignInModal } from "@/components/AuthUI/SignInModal";

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
      <SignInModal />
      <Toaster />
    </>
  );
}
