import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";

// 💭 TODO: Rewrite this file after backend is ready
// 🔧 Notes: this is fine for demo but not production ready. need real error handling, testing and security pass. Audit needed
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
    async redirect({ url, baseUrl }) {
      try {
        const isInternal = url.startsWith(baseUrl) || url.startsWith("/");
        if (isInternal) {
          if (url.startsWith("/")) return `${baseUrl}${url}`;
          return url;
        }
      } catch (e) {
        console.error("Error in redirect callback:", e);
      }
      return `${baseUrl}/workspace`;
    },

    async jwt({ token, user, trigger, session }) {
      const newToken = { ...token };

      if (user) {
        newToken.id = user.id as string;
      }
      if (newToken?.id && (user || trigger === "update")) {
        try {
          const { db, users } = await import("@sandworm/database");
          const { eq } = await import("drizzle-orm");
          const rows = await db
            .select({
              isOnboarded: users.isOnboarded,
              username: users.username,
            })
            .from(users)
            .where(eq(users.id, newToken.id as string))
            .limit(1);
          if (rows[0]) {
            newToken.isOnboarded = rows[0].isOnboarded ?? false;
            newToken.hasUsername = !!rows[0].username;
          }
        } catch (e) {
          console.error("Error fetching user data:", e);
        }
      }
      if (session) {
        newToken.isOnboarded =
          (session as any).user?.isOnboarded ?? newToken.isOnboarded;
        newToken.hasUsername =
          (session as any).user?.hasUsername ?? newToken.hasUsername;
      }
      return newToken;
    },

    async session({ session, token }) {
      const isOnboarded = (token as any).isOnboarded ?? false;
      const hasUsername = (token as any).hasUsername ?? false;
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          isOnboarded,
          hasUsername,
        },
      } as any;
    },

    async signIn({ user }) {
      try {
        if (!user?.email) return false;

        const cookieStore = await cookies();
        const intent = cookieStore.get("auth_intent")?.value;
        try {
          if (cookieStore.has("auth_intent")) cookieStore.delete("auth_intent");
        } catch (e) {
          console.error("Error deleting auth_intent cookie:", e);
        }

        const { db, users } = await import("@sandworm/database");
        const { eq } = await import("drizzle-orm");

        if (intent === "signin") {
          const existing = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          if (!existing.length) {
            return "/signin?error=NoAccount";
          }
        }

        const info = await db
          .select({ isOnboarded: users.isOnboarded, username: users.username })
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);
        if (info[0] && (!info[0].isOnboarded || !info[0].username)) {
          return "/claim";
        }

        return true;
      } catch (err) {
        console.error("Sign-in callback error", err);
        return false;
      }
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
