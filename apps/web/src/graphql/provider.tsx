/**
 * Apollo Provider wrapper
 * - Initialize client once (singleton) in client-side apps (e.g. Next.js _app)
 * - Provide typed client to the app
 */

import React, { useMemo } from "react";
import { createApolloClient } from "./client";
import { ApolloProvider } from "@apollo/client/react";

type Props = {
  children: React.ReactNode;
  graphqlUrl: string;
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
};

export const GraphQLProvider: React.FC<Props> = ({ children, graphqlUrl, getAccessToken, refreshAccessToken }) => {
  // memoize client to avoid re-creation on rerenders
  const client = useMemo(
    () => createApolloClient({ graphqlUrl, getAccessToken, refreshAccessToken }),
    [graphqlUrl]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
