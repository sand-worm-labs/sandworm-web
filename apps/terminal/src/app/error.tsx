"use client";

import { ErrorPage } from "@/components/Error/ErrorPage";

// Errors outside the app's own pages: sign-in, setup and the team tools
export default function RootError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage {...props} isFullPage />;
}
