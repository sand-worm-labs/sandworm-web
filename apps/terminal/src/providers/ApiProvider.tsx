"use client";

import { env } from "@/config/env";
import { GraphQLProvider } from "@/graphql/provider";
import type { ChildrenProps } from "@/types";

const API_URL = env.apiUrl;

const refreshAccessToken = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Refresh failed with status: ${response.status}`);
  }
};

export function ApiProvider({ children }: ChildrenProps) {
  return (
    <GraphQLProvider
      graphqlUrl={`${API_URL}/graphql`}
      refreshAccessToken={refreshAccessToken}
    >
      {children}
    </GraphQLProvider>
  );
}
