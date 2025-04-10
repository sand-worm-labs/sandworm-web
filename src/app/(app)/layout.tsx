import FooterWrapper from "@/components/AppFooter/FooterWrapper";
import AppHeader from "@/components/AppHeader";
import { Toaster } from "sonner";

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
