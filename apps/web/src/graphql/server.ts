import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { headers } from "next/headers";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://localhost:8003";

const _serverClient = new ApolloClient({
  ssrMode: true,
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: `${INTERNAL_API_URL}/api/graphql`,
    fetchOptions: { cache: "no-store" },
  }),
});

export async function getServerClient() {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";

  _serverClient.resetStore().catch(() => {});

  _serverClient.setLink(
    new HttpLink({
      uri: `${INTERNAL_API_URL}/api/graphql`,
      headers: { cookie },
      fetchOptions: { cache: "no-store" },
    })
  );

  return _serverClient;
}
