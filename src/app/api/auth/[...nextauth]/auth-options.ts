import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

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
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Redirect to /workspace after successful login
      return baseUrl + "/workspace";
    },
    async session({ session, token }) {
      // Always add user ID from token
      if (token.sub) {
        session.user.id = token.sub;
      }

      // Debug logging
      console.log("Session callback:", {
        sessionUser: session.user,
        token,
      });

      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Debug logging
      console.log("JWT callback:", {
        token,
        user,
        account,
        profile,
      });

      // Add any additional token properties if needed
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async signIn({ user, account, profile }) {
      console.log("Sign-in attempt:", {
        user,
        account,
        profile,
      });

      // Add any additional sign-in validation
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
