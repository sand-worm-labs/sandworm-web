export type Access =
  | { _tag: "allowed" }
  | { _tag: "signedOut" }
  | { _tag: "noClient"; email: string | null };
