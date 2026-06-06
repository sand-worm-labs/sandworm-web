"use client";

import type { ReactNode } from "react";

import { GraphQLProvider } from "@/graphql/provider";
import { NEXT_PUBLIC_API_URL } from "@/utils/env";

import { ThemeProvider } from "./ThemeProvider";
import AppProvider from "./AppProvider";

const GRAPHQL_URL = `${NEXT_PUBLIC_API_URL()}/graphql`;
console.log("[RootProvider] GRAPHQL_URL resolved to:", GRAPHQL_URL);

const refreshAccessToken = async (): Promise<void> => {
  const response = await fetch(`${NEXT_PUBLIC_API_URL()}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Refresh failed with status: ${response.status}`);
  }
};

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <GraphQLProvider
        graphqlUrl={GRAPHQL_URL}
        refreshAccessToken={refreshAccessToken}
      >
        <AppProvider>{children}</AppProvider>
      </GraphQLProvider>
    </ThemeProvider>
  );
}
