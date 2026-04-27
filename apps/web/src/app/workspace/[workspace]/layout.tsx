"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { Toaster } from "@sandworm/ui/components/sonner";

import { FooterWrapper } from "@/components/Layout/AppFooter/FooterWrapper";
import { SignInModal } from "@/components/AuthUI/SignInModal";
import DndBackendProvider from "@/components/Editor/blocks/DndBackendProvider";
import { DocumentsProvider } from "@/components/Editor/hooks/useDocuments";
import { WebsocketProvider } from "@/components/Editor/hooks/useWebSocket";
import { EnvironmentStatusProvider } from "@/components/Editor/hooks/useEnvironmentStatus";
import { DataSourcesProvider } from "@/components/Editor/hooks/useDataSources";
import { ReusableComponentsProvider } from "@/components/Editor/hooks/useReusableComponents";
import { CommentsProvider } from "@/components/Editor/hooks/useComments";

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
                    <ReusableComponentsProvider workspaceId="">
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
            className:
              " border border-border-secondary shadow-xl rounded-2xl text-ink-100 bg-base-100 ",
          }}
        />
      </ProgressProvider>
    </div>
  );
}
