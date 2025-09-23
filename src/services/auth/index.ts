import NextAuth from "next-auth";

import authConfig from "./auth.config";
import { AuthAdapter } from "./adapter";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: AuthAdapter,
  session: { strategy: "jwt" },
  ...authConfig,
});
