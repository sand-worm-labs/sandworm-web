import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { cache } from "react";
import { headers } from "next/headers";

export const getServerClient = cache(async () => { 
    const headersList = await headers();
    const cookie = headersList.get("cookie") ?? "";

    return new ApolloClient({
        ssrMode: true,
        cache: new InMemoryCache(),
        link: new HttpLink({
            uri: `http://localhost:8003/graphql`,
            headers: {
                cookie: cookie,
            },
            fetchOptions: { cache: "no-store" },
        }),
    });
});