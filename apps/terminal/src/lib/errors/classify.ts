export type ErrorKind = "server" | "network" | "database" | "auth" | "client";

type ClassifiableError = Error & { statusCode?: number; code?: string };

const has = (message: string, ...parts: string[]) =>
  parts.some(part => message.includes(part));

// What went wrong, as far as the error says. In production Next replaces a
// server error's message with a generic one, so most of those land on
// "client"; in development the real message decides.
export function errorKindOf(error: ClassifiableError): ErrorKind {
  if (error.statusCode) {
    if (error.statusCode >= 500) return "server";
    if (error.statusCode === 403 || error.statusCode === 401) return "auth";
  }
  if (error.name === "ServerError" || error.code === "ECONNREFUSED") {
    return "server";
  }
  if (error.name === "NetworkError" || error.code === "NETWORK_ERROR") {
    return "network";
  }
  if (error.name === "DatabaseError" || error.code?.includes("POSTGRES")) {
    return "database";
  }

  const message = error.message.toLowerCase();
  if (has(message, "unauthorized", "forbidden")) return "auth";
  if (has(message, "fetch failed", "network", "connection")) return "network";
  if (has(message, "service unavailable", "500", "server")) return "server";
  if (has(message, "database", "query", "does not exist")) return "database";
  return "client";
}
