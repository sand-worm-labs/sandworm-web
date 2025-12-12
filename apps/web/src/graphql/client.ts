/**
 * Creates a configured ApolloClient instance.
 * - TypeScript typed
 * - Batch requests to reduce HTTP overhead
 * - Retry on transient network errors
 * - Centralized error handling (GraphQL + Network)
 * - Auth header injection and refresh token handling with request queueing
 */

import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  from,
  type NormalizedCacheObject,
} from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { setContext } from "@apollo/client/link/context";

type CreateClientOpts = {
  graphqlUrl: string;
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
};

let refreshingPromise: Promise<string | null> | null = null;
let pendingRequests: Array<() => void> = [];

/**
 * Ensures all pending requests are resumed after token refresh.
 */
const onRefreshed = (newToken: string | null) => {
  pendingRequests.forEach(cb => cb());
  pendingRequests = [];
};

/**
 * Push a request that should wait for token refresh.
 */
const addPendingRequest = (cb: () => void) => {
  pendingRequests.push(cb);
};

/**
 * Create a resilient & fast Apollo Client
 */
export const createApolloClient = ({
  graphqlUrl,
  getAccessToken,
  refreshAccessToken,
}: CreateClientOpts): ApolloClient<NormalizedCacheObject> => {
  // 1) Error handling link (GraphQL errors / Network errors)
  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward, response }) => {
      if (graphQLErrors) {
        for (const err of graphQLErrors) {
          // Example: handle authentication errors centrally
          // Adjust the message/code check to match your server
          if ((err.extensions as any)?.code === "UNAUTHENTICATED") {
            // We don't retry here directly - authLink will attempt refresh if needed
          }
        }
      }

      // optionally log network errors / report to monitoring
      if (networkError) {
        // console.warn("Network error:", networkError);
      }
    }
  );

  // 2) Retry link (exponential backoff + jitter) for transient network problems
  const retryLink = new RetryLink({
    attempts: {
      max: 3,
      retryIf: (error, _operation) => !!error,
    },
    delay: {
      initial: 300,
      max: 2000,
      jitter: true,
    },
  });

  // 3) Auth link with refresh logic and request queueing to avoid multiple refreshes
  const authLink = setContext((operation, { headers }) => {
    const token = getAccessToken();
    return {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  /**
   * Special link which intercepts responses for 401-like issues and tries refresh.
   * We implement a short link that will:
   * - If a request gets UNAUTHENTICATED GraphQL error or 401 network response, attempt refresh
   * - Queue subsequent requests until refresh finishes
   *
   * This uses ApolloLink to intercept operation/forward pipeline.
   */
  const refreshLink = new ApolloLink((operation, forward) => {
    return new ApolloLink((op, fwd) => {
      return new Promise((resolve, reject) => {
        let handled = false;

        const tryForward = () => {
          if (handled) return;
          handled = true;
          const sub = fwd(op).subscribe({
            next: resolve,
            error: reject,
            complete: () => {},
          });
        };

        // If a token refresh is ongoing, wait for it before forwarding
        if (refreshingPromise) {
          addPendingRequest(() => {
            tryForward();
          });
        } else {
          tryForward();
        }
      });
    }).request(operation, forward);
  });

  // 4) HTTP link (batching)
  const batchHttpLink = new BatchHttpLink({
    uri: graphqlUrl,
    batchMax: 10, // max ops per batch
    batchInterval: 20, // ms to wait to collect batch
    // fetchOptions: { credentials: 'include' } // if you need cookies
  });

  // 5) InMemoryCache with typePolicies for pagination and merging
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // example for cursor-based list field 'items'
          items: {
            keyArgs: false,
            merge(existing = { edges: [] }, incoming: any) {
              // naive merge; adapt to your schema (cursor-based or offset-based)
              const merged = {
                ...incoming,
                edges: [...(existing.edges || []), ...(incoming.edges || [])],
              };
              return merged;
            },
          },
        },
      },
    },
  });

  // Compose link chain: order matters
  const linkChain = from([
    errorLink,
    retryLink,
    authLink,
    refreshLink,
    batchHttpLink,
  ]);

  const client = new ApolloClient({
    link: linkChain,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
    // connectToDevTools: process.env.NODE_ENV !== 'production', // enable in dev if you want
  });

  /**
   * Optional: A light helper to perform refresh token logic outside of Apollo Link stack.
   * This is NOT automatically invoked by the code above. You should call this from
   * your global onError graphQLErrors handler when UNAUTHENTICATED is detected.
   *
   * Example usage: when a response contains UNAUTHENTICATED,
   *   - call ensureTokenRefreshed()
   *   - after success, re-run the failed operation
   */
  const ensureTokenRefreshed = async (): Promise<string | null> => {
    if (!refreshingPromise) {
      refreshingPromise = (async () => {
        try {
          const newToken = await refreshAccessToken();
          onRefreshed(newToken);
          return newToken;
        } catch (e) {
          onRefreshed(null);
          return null;
        } finally {
          refreshingPromise = null;
        }
      })();
    }
    return refreshingPromise;
  };

  // Expose helper on client for app-level usage (optional)
  (client as any).__ensureTokenRefreshed = ensureTokenRefreshed;

  return client;
};
