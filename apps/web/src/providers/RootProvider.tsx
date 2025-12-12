"use client";

import type { ReactNode } from "react";

import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./query";
import AppProvider from "./AppProvider";
import { GraphQLProvider } from "@/graphql/provider";
import { createApolloClient } from "@/graphql/client";

const client = createApolloClient({
  graphqlUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL!,
  getAccessToken,
  refreshAccessToken,
});

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <GraphQLProvider client={client}>
        <QueryProvider>
          <AppProvider>{children}</AppProvider>
        </QueryProvider>
      </GraphQLProvider>
    </ThemeProvider>
  );
}
