"use client";

import type { ApiDocument } from "@/types";

import { useSession } from "./hooks/useAuth";
import AccountMenu from "./PublicHeader/AccountMenu";
import ForkButton from "./PublicHeader/ForkButton";
import HelpDropdown from "./PublicHeader/HelpDropdown";
import PublicHeaderLogo from "./PublicHeader/Logo";
import NotebookTitle from "./PublicHeader/NotebookTitle";
import ReadOnlyBanner from "./PublicHeader/ReadOnlyBanner";
import ShareButton from "./PublicHeader/ShareButton";
import ViewSwitcher, { type NotebookView } from "./ViewSwitcher";

interface PublicNotebookBannerProps {
  document: ApiDocument | null;
  view: NotebookView;
  onChangeView: (view: NotebookView) => void;
  notFound?: boolean;
}

export default function PublicNotebookBanner({
  document,
  view,
  onChangeView,
  notFound = false,
}: PublicNotebookBannerProps) {
  const { user, loading, isAuthenticated } = useSession({
    redirectToLogin: false,
  });

  const isOwnDocument = !!user && !!document && document.authorId === user.id;

  return (
    <div className="w-full bg-base-100 font-body relative">
      <div className="h-14 w-full flex items-center gap-3 px-5 border-b border-border-secondary dark:border-border-tertiary">
        <PublicHeaderLogo />

        {!notFound && (
          <>
            <span
              className="text-border-secondary dark:text-border-tertiary select-none"
              aria-hidden
            >
              /
            </span>

            <div className="flex-1 min-w-0">
              <NotebookTitle
                title={document?.title ?? null}
                isLoading={!document}
              />
            </div>
          </>
        )}

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {!notFound && (
            <>
              <ViewSwitcher view={view} onChange={onChangeView} />
              <ShareButton />
              {!isOwnDocument && (
                <ForkButton
                  document={
                    document && { id: document.id, title: document.title }
                  }
                  isAuthenticated={isAuthenticated}
                />
              )}

              <div className="h-5 w-px bg-[#E8E8EA] dark:bg-border-tertiary" />
            </>
          )}

          <HelpDropdown />
          <AccountMenu user={user} loading={loading} />
        </div>
      </div>

      {!notFound && (
        <ReadOnlyBanner
          document={document && { id: document.id, title: document.title }}
          isAuthenticated={isAuthenticated}
          onChangeView={onChangeView}
        />
      )}
    </div>
  );
}
