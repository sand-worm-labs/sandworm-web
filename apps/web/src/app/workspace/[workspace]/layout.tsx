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
import { CommentsProvider } from "@/components/Visualization/hooks/useComments";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-body ">
      <ProgressProvider
        height="1px"
        color="#A308F0"
        options={{ showSpinner: false }}
        shallowRouting
      >
        <WebsocketProvider>
          <DocumentsProvider>
            <CommentsProvider>
              <DndBackendProvider>
                <EnvironmentStatusProvider>
                  <DataSourcesProvider>
                    <ReusableComponentsProvider>
                      <main> {children}</main>
                    </ReusableComponentsProvider>
                  </DataSourcesProvider>
                </EnvironmentStatusProvider>
              </DndBackendProvider>
            </CommentsProvider>
          </DocumentsProvider>
        </WebsocketProvider>

        <FooterWrapper />
        <SignInModal />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: " border border-border-secondary shadow-xl rounded-xl text-ink-100  ",
          }}
        />
      </ProgressProvider>
    </div>
  );
}
