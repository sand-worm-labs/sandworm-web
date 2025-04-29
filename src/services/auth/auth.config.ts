import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async redirect({ baseUrl }) {
      return `${baseUrl}/workspace`;
    },

    async jwt({ token, user }) {
      const newToken = {
        ...token,
        ...(user && { id: user.id as string }),
      };

      return newToken;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },

    async signIn({ user }) {
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
} satisfies NextAuthConfig;

export default authConfig;
