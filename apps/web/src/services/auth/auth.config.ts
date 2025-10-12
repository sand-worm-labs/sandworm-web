import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";

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
    // Respect provided callbackUrl for internal redirects (e.g., /claim for signup), else default to /workspace
    async redirect({ url, baseUrl }) {
      try {
        // Allow callbacks to internal paths only
        const isInternal = url.startsWith(baseUrl) || url.startsWith("/");
        if (isInternal) {
          // Preserve relative URLs
          if (url.startsWith("/")) return `${baseUrl}${url}`;
          return url;
        }
      } catch (e) {
        // fall through
      }
      return `${baseUrl}/workspace`;
    },

    async jwt({ token, user, trigger, session }) {
      // Enrich token with id and onboarding flags when available
      if (user) {
        token.id = user.id as string;
      }
      // On subsequent calls or session update, fetch onboarding flags from DB
      if (token?.id && (user || trigger === "update")) {
        try {
          const { db, users } = await import("@sandworm/database");
          const { eq } = await import("drizzle-orm");
          const rows = await db
            .select({
              isOnboarded: users.isOnboarded,
              username: users.username,
            })
            .from(users)
            .where(eq(users.id, token.id as string))
            .limit(1);
          if (rows[0]) {
            token["isOnboarded"] = rows[0].isOnboarded ?? false;
            token["hasUsername"] = !!rows[0].username;
          }
        } catch (e) {
          // ignore
        }
      }
      if (session) {
        // when session is updated, merge flags from session
        token["isOnboarded"] =
          (session as any).user?.isOnboarded ?? token["isOnboarded"];
        token["hasUsername"] =
          (session as any).user?.hasUsername ?? token["hasUsername"];
      }
      return token;
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
      // Enforce flow: if user clicked "Sign in" and account doesn't exist yet, show NoAccount error instead of creating
      try {
        if (!user?.email) return false;

        const cookieStore = await cookies();
        const intent = cookieStore.get("auth_intent")?.value; // 'signin' | 'signup'
        try {
          if (cookieStore.has("auth_intent")) cookieStore.delete("auth_intent");
        } catch {}

        const { db, users } = await import("@sandworm/database");
        const { eq } = await import("drizzle-orm");

        if (intent === "signin") {
          const existing = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          if (!existing.length) {
            // Block sign in and route back with message
            return "/signin?error=NoAccount";
          }
        }

        // If user is not onboarded yet, always route to claim page after auth
        const info = await db
          .select({ isOnboarded: users.isOnboarded, username: users.username })
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);
        if (info[0] && (!info[0].isOnboarded || !info[0].username)) {
          return "/claim";
        }

        // Allow normal flow otherwise (including creating a new user during signup)
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
