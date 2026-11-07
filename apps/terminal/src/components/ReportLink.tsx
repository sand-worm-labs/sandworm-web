import type { ReactNode } from "react";

import { AppLink } from "./AppLink";

type ReportLinkProps = {
  // The report in the web app, when the API knows which document it is
  url?: string;
  className?: string;
  children: ReactNode;
};

// A report opens as its notebook in the web app. Without a URL (the preview
// fixtures) it falls back to the terminal's report route.
export function ReportLink({ url, className, children }: ReportLinkProps) {
  if (!url) {
    return (
      <AppLink route="report" className={className}>
        {children}
      </AppLink>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}
