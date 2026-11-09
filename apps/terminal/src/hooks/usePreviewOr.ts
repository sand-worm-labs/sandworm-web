import { useEffect, useState } from "react";
import type { ApolloError } from "@apollo/client";

import { isUnauthenticated } from "@/lib/graphql-errors";
import { usePreview } from "@/providers/PreviewProvider";

// Live data for a member, the preview fixture for a forced preview and for
// anyone the API does not know (the browser's `liveOr`). Pass the query's
// `data` and `error`, and skip the query yourself when `isForced`. `data` is
// undefined while loading; the fixture waits for mount so the server and the
// browser agree on what they first draw.
export function usePreviewOr<T>(
  live: T | null | undefined,
  error: ApolloError | undefined,
  fixture: () => T
): { data: T | undefined; error: boolean } {
  const { isForced } = usePreview();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const isPreview =
    isForced || live === null || !!error?.graphQLErrors.some(isUnauthenticated);
  if (isPreview)
    return { data: isMounted ? fixture() : undefined, error: false };
  return { data: live, error: !!error };
}
