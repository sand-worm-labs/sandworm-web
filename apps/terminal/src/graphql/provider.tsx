// =====================================
// ⬢Apollo Provider wrapper
// =====================================
import React, { useMemo } from "react";
import { ApolloProvider } from "@apollo/client/react";

import { createApolloClient } from "./client";

type Props = {
  children: React.ReactNode;
  graphqlUrl: string;
  refreshAccessToken: () => Promise<void>;
};

export const GraphQLProvider: React.FC<Props> = ({
  children,
  graphqlUrl,
  refreshAccessToken,
}) => {
  const client = useMemo(
    () => createApolloClient({ graphqlUrl, refreshAccessToken }),
    [graphqlUrl]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
