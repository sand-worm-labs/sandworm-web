import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { FirebaseAuthAdapter } from "./adapter";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: FirebaseAuthAdapter(),
  session: { strategy: "jwt" },
  ...authConfig,
});
