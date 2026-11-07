import type { Access } from "./types";

type Visitor = { email: string | null } | null;

export function resolveAccess(visitor: Visitor, hasClient: boolean): Access {
  if (!visitor) return { _tag: "signedOut" };
  if (!hasClient) return { _tag: "noClient", email: visitor.email };
  return { _tag: "allowed" };
}
