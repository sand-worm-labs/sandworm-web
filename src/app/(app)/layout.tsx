"use client";

import { ProgressProvider } from "@bprogress/next/app";

import { Toaster } from "@/components/ui/sonner";
import { FooterWrapper } from "@/components/Layout/AppFooter/FooterWrapper";
import { AppHeader } from "@/components/Layout/AppHeader";
import { SignInModal } from "@/components/AuthUI/SignInModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="1px"
      color="#FF7F4F"
      options={{ showSpinner: false }}
      shallowRouting
    >
      <AppHeader />
      <main>{children}</main>
      <FooterWrapper />
      <SignInModal />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "bg-black text-white border border-neutral-700 shadow-xl rounded-none dm-sans ",
        }}
      />
    </ProgressProvider>
  );
}
