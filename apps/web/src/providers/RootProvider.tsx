"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./query";
import AppProvider from "./AppProvider";

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AppProvider>{children}</AppProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
