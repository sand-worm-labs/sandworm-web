"use client";

import { ErrorPage } from "@/components/Error/ErrorPage";

// An error in one of the app's pages: the header stays, the page is replaced
export default function AppError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage {...props} />;
}
