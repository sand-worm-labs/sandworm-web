import { cookies } from "next/headers";

import { env } from "@/config/env";
import { isUnauthenticated, type GraphQLError } from "@/lib/graphql-errors";

export class ApiUnauthenticatedError extends Error {
  constructor() {
    super("Not signed in");
    this.name = "ApiUnauthenticatedError";
  }
}

type GqlOptions = {
  // Public data is asked for without the visitor's session.
  auth?: boolean;
};

// Asks the API's GraphQL endpoint directly (server only), as the signed-in
// visitor: their session cookies go with the request. The middleware has
// already refreshed an expired access token by the time a page renders.
export async function gql<T>(
  query: string,
  variables?: Record<string, unknown>,
  { auth = true }: GqlOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) headers.cookie = (await cookies()).toString();

  const res = await fetch(`${env.internalApiUrl}/api/graphql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (res.status === 401) throw new ApiUnauthenticatedError();

  const json = (await res.json()) as { data?: T; errors?: GraphQLError[] };
  const error = json.errors?.[0];
  if (error) {
    if (isUnauthenticated(error)) throw new ApiUnauthenticatedError();
    throw new Error(`[api] ${error.message}`);
  }
  if (!json.data) throw new Error("[api] empty response");

  return json.data;
}
