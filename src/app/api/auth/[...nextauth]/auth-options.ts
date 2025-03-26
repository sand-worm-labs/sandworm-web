import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

if (!process.env.NEXTAUTH_SECRET) {
  console.log("no secret", process.env.NEXTAUTH_SECRET);
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) return session;

      session.user.id = user.id;

      session.user.isActive = user.isActive;

      return session;
    },
    async signIn({ user, account, profile }) {
      console.error("Sign-in attempt:", { user, account, profile });
      return true;
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.email || !user.name) {
        console.log("user");
      }
    },
  },
});
