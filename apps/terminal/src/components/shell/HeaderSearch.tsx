"use client";

import { SearchPalette } from "@sandworm/ui/kit/search-palette";

import { env } from "@/config/env";
import { searchClient } from "@/lib/search-client";

// The web app's search. What it finds is public content that lives in the web app, so a
// result opens there, in a new tab.
export function HeaderSearch() {
  return (
    <SearchPalette
      client={searchClient}
      onSelect={(_, item) => {
        if (!item.url.startsWith("/")) return;
        window.open(`${env.webAppUrl}${item.url}`, "_blank", "noopener");
      }}
    />
  );
}
