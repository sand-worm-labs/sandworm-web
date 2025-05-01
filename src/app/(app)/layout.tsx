import { Toaster } from "@/components/ui/sonner";
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
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "bg-black text-white border border-neutral-700 shadow-xl rounded-none",
        }}
      />
    </>
  );
}
