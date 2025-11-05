"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./query";
import AppProvider from "./AppProvider";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AppProvider>{children}</AppProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
