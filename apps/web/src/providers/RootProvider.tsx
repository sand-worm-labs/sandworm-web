"use client";

import type { ReactNode } from "react";

import { GraphQLProvider } from "@/graphql/provider";
import { tokenStorage } from "@/components/Visualization/hooks/useAuth";

import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./query";
import AppProvider from "./AppProvider";

const GRAPHQL_URL = "http://localhost:8003/graphql";

const getAccessToken = () => {
  return tokenStorage.getToken();
};

const refreshAccessToken = async (): Promise<string | null> => {
  console.log(" Starting token refresh...");
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    console.log(" No refresh token found");
    tokenStorage.clearTokens();
    return null;
  }

  try {
    console.log("Calling refresh endpoint...");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!response.ok) {
      console.log("Refresh failed with status:", response.status);
      throw new Error("Refresh failed");
    }

    const data = await response.json();
    console.log(" Token refreshed successfully");

    // Store new tokens
    tokenStorage.setTokens(data.token, data.refreshToken, data.tokenExpires);

    return data.token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    tokenStorage.clearTokens();
    return null;
  }
};

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <GraphQLProvider
        graphqlUrl={GRAPHQL_URL}
        getAccessToken={getAccessToken}
        refreshAccessToken={refreshAccessToken}
      >
        <QueryProvider>
          <AppProvider>{children}</AppProvider>
        </QueryProvider>
      </GraphQLProvider>
    </ThemeProvider>
  );
}
