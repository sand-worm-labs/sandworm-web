"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { Toaster } from "@sandworm/ui/components/sonner";

import { FooterWrapper } from "@/components/Layout/AppFooter/FooterWrapper";
import { AppHeader } from "@/components/Layout/AppHeader";
import { SignInModal } from "@/components/AuthUI/SignInModal";
import DndBackendProvider from "@/components/Visualization/blocks/DndBackendProvider";
import { DocumentsProvider } from "@/components/Visualization/hooks/useDocuments";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-primary">
      <ProgressProvider
        height="1px"
        color="#FF7F4F"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <AppHeader />
        <DocumentsProvider>
          <DndBackendProvider>
            <main> {children}</main>
          </DndBackendProvider>
        </DocumentsProvider>
        <FooterWrapper />
        <SignInModal />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: " border border-neutral-700 shadow-xl rounded-none  ",
          }}
        />
      </ProgressProvider>
    </div>
  );
}
