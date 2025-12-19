"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { Toaster } from "@sandworm/ui/components/sonner";

import { FooterWrapper } from "@/components/Layout/AppFooter/FooterWrapper";
import { SignInModal } from "@/components/AuthUI/SignInModal";
import DndBackendProvider from "@/components/Visualization/blocks/DndBackendProvider";
import { DocumentsProvider } from "@/components/Visualization/hooks/useDocuments";
import { WebsocketProvider } from "@/components/Visualization/hooks/useWebSocket";
import { EnvironmentStatusProvider } from "@/components/Visualization/hooks/useEnvironmentStatus";
import { DataSourcesProvider } from "@/components/Visualization/hooks/useDataSources";
import { ReusableComponentsProvider } from "@/components/Visualization/hooks/useReusableComponents";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-primary">
      <ProgressProvider
        height="1px"
        color="#FF7F4F"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <DocumentsProvider>
          <DndBackendProvider>
            <WebsocketProvider>
              <EnvironmentStatusProvider>
                <DataSourcesProvider>
                  <ReusableComponentsProvider>
                    <main> {children}</main>
                  </ReusableComponentsProvider>
                </DataSourcesProvider>
              </EnvironmentStatusProvider>
            </WebsocketProvider>
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
