/**
 * Creates a configured ApolloClient instance.
 * - TypeScript typed
 * - Regular HTTP requests (batching disabled to fix 400 error)
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
  Observable,
  HttpLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import { setContext } from "@apollo/client/link/context";
import { tokenStorage } from "@/components/Visualization/hooks/useAuth";

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
  console.log("🚀 Initializing Apollo Client with URL:", graphqlUrl);

  // 1) Error handling link (GraphQL errors / Network errors)
  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward, response }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`,
            extensions
          );

          // Handle authentication errors
          if ((extensions as any)?.code === "UNAUTHENTICATED") {
            console.warn(
              "UNAUTHENTICATED error detected - token may need refresh"
            );
          }
        });
      }

      if (networkError) {
        console.error(`[Network error]: ${networkError.message}`, networkError);
        // Log more details for 400 errors
        if ("statusCode" in networkError && networkError.statusCode === 400) {
          console.error(
            "400 Bad Request - Check request format and server logs"
          );
          console.error("Operation:", operation.operationName);
          console.error("Variables:", operation.variables);
        }
      }
    }
  );

  // 2) Retry link (exponential backoff + jitter) for transient network problems
  const retryLink = new RetryLink({
    attempts: {
      max: 3,
      retryIf: (error, _operation) => {
        // Don't retry on 400 errors (bad request)
        if (error && "statusCode" in error && error.statusCode === 400) {
          return false;
        }
        return !!error;
      },
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

    console.log("🔑 Auth Link - Token:", token ? "Present" : "Missing");

    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  });

  /**
   * Special link which intercepts responses for 401-like issues and tries refresh.
   * This properly returns an Observable that Apollo can subscribe to.
   */
  const refreshLink = new ApolloLink((operation, forward) => {
    // If a token refresh is ongoing, wait for it before forwarding
    if (refreshingPromise) {
      return new Observable(observer => {
        let sub: any;

        addPendingRequest(() => {
          // After refresh completes, forward the operation
          sub = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        });

        // Cleanup function
        return () => {
          if (sub) sub.unsubscribe();
        };
      });
    }

    // No refresh in progress, forward normally
    return forward(operation);
  });

  // 4) HTTP link (REGULAR - not batched to avoid 400 errors)
  const httpLink = new HttpLink({
    uri: graphqlUrl,
    credentials: "include", // Include cookies if needed
    fetch: (uri, options) => {
      console.log("📤 GraphQL Request:", {
        uri,
        method: options?.method,
        headers: options?.headers,
        bodyPreview: options?.body ? JSON.parse(options.body as string) : null,
      });

      return fetch(uri, options).then(response => {
        console.log("📥 GraphQL Response:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });

        return response;
      });
    },
  });

  // 5) InMemoryCache with typePolicies for pagination and merging
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          currentUser: {
            merge(existing, incoming) {
              return incoming;
            },
          },
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
    httpLink,
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
    connectToDevTools: process.env.NODE_ENV !== "production", // enable in dev
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
