"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// A page framed by another app (/embed/<page>/<light|dark>) takes that app's
// theme from its path, and never touches the theme this browser saved here.
const EMBED_THEME = /^\/embed\/[^/]+\/(light|dark)\/?$/;

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const embedTheme = usePathname()?.match(EMBED_THEME)?.[1];

  return (
    <NextThemesProvider
      {...props}
      forcedTheme={embedTheme ?? props.forcedTheme}
    >
      {children}
    </NextThemesProvider>
  );
}
