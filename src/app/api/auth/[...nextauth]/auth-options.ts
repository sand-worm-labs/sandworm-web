import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { FirebaseAuthAdapter } from "@/services/auth/adapter";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  adapter: FirebaseAuthAdapter(),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async redirect({ baseUrl }) {
      return `${baseUrl}/workspace`;
    },
    async session({ session, token }) {
      const newSession = {
        ...session,
        userId: token?.sub ?? null,
      };

      return newSession;
    },
    async jwt({ token, user, account, profile }) {
      const newToken = {
        ...token,
        ...(user && { id: user.id }),
      };

      return newToken;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error("Sign-in failed: No email");
        return false;
      }

      return true;
    },
  },
  events: {
    async createUser({ user }) {
      console.log("User created:", user);
    },
    async signIn({ user, account }) {
      console.log("User signed in:", { user, account });
    },
  },
  debug: process.env.NODE_ENV === "development",
});
