import { SearchClient } from "@sandworm/ui/kit/lib/search-client";

import { env } from "@/config/env";

// The search the web app uses, asked of the same endpoint. Only called in the browser,
// when the palette opens.
export const searchClient = new SearchClient(
  () => env.publicApiUrl ?? `${window.location.origin}/api`
);
