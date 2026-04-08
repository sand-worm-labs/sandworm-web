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

type CreateClientOpts = {
  graphqlUrl: string;
  refreshAccessToken: () => Promise<void>;
};

let refreshingPromise: Promise<void> | null = null;
let pendingRequests: Array<() => void> = [];

const onRefreshed = () => {
  pendingRequests.forEach(cb => cb());
  pendingRequests = [];
};

const addPendingRequest = (cb: () => void) => {
  pendingRequests.push(cb);
};

export const createApolloClient = ({
  graphqlUrl,
  refreshAccessToken,
}: CreateClientOpts): ApolloClient<NormalizedCacheObject> => {
  // 1) Error handling link
  const errorLink = onError(
    // eslint-disable-next-line consistent-return
    ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(err => {
          console.error(
            `[GraphQL error]: Message: ${err.message}, Location: ${JSON.stringify(err.locations)}, Path: ${err.path}`,
            err.extensions
          );
        });

        const authError = graphQLErrors.find(err => {
          const code = (err.extensions as any)?.code;
          return (
            code === "UNAUTHENTICATED" ||
            (code === "INTERNAL_SERVER_ERROR" &&
              err.message.includes("Invalid or expired token"))
          );
        });

        if (authError) {
          console.warn("⚠️ Token expired — attempting refresh");

          // If already refreshing, queue this request
          if (refreshingPromise) {
            return new Observable(observer => {
              addPendingRequest(() => {
                forward(operation).subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                });
              });
            });
          }

          // Start refresh — server reads refresh_token cookie and sets new access_token cookie
          refreshingPromise = refreshAccessToken()
            .then(() => {
              onRefreshed();
            })
            .catch(() => {
              onRefreshed();
              if (typeof window !== "undefined") {
                window.location.href = "/signin";
              }
            })
            .finally(() => {
              refreshingPromise = null;
            });

          // Wait for refresh then retry
          return new Observable(observer => {
            refreshingPromise!.then(() => {
              forward(operation).subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });
            });
          });
        }
      }

      if (networkError) {
        console.error(`[Network error]: ${networkError.message}`, networkError);
        if ("statusCode" in networkError && networkError.statusCode === 400) {
          console.error(
            "400 Bad Request — Operation:",
            operation.operationName
          );
        }
      }
    }
  );

  // 2) Retry link for transient network errors
  const retryLink = new RetryLink({
    attempts: {
      max: 3,
      retryIf: error => {
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

  // 3) Queue link — holds requests while a refresh is in progress
  const refreshQueueLink = new ApolloLink((operation, forward) => {
    if (refreshingPromise) {
      return new Observable(observer => {
        let sub: any;
        addPendingRequest(() => {
          sub = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });
        });
        return () => sub?.unsubscribe();
      });
    }
    return forward(operation);
  });

  // 4) HTTP link — credentials: "include" so browser sends HttpOnly cookies
  const httpLink = new HttpLink({
    uri: graphqlUrl,
    credentials: "include",
  });

  // 5) Cache
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          currentUser: {
            merge(_, incoming) {
              return incoming;
            },
          },
          items: {
            keyArgs: false,
            merge(incoming: any, existing = { edges: [] }) {
              return {
                ...incoming,
                edges: [...(existing.edges || []), ...(incoming.edges || [])],
              };
            },
          },
        },
      },
    },
  });

  // No authLink — cookies replace the Authorization header entirely
  const linkChain = from([errorLink, retryLink, refreshQueueLink, httpLink]);

  return new ApolloClient({
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
    connectToDevTools: process.env.NODE_ENV !== "production",
  });
};
