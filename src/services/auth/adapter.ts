// services/auth/typesaurus-adapter.ts
import crypto from "crypto";

import type { Adapter } from "next-auth/adapters";

import type { UserService } from "../firebase/db/UserService";

export function TypesaurusAdapter(
  db: any,
  userService: typeof UserService
): Adapter {
  return {
    async createUser(user) {
      // Generate password for OAuth users
      const password = await userService.hashPassword(
        crypto.randomBytes(32).toString("hex")
      );

      const result = await userService.create(
        user.name || `user_${crypto.randomBytes(4).toString("hex")}`,
        user.email,
        password
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        id: result.data.id,
        name: result.data.data.username,
        email: result.data.data.email,
        emailVerified: null,
      };
    },

    async getUser(id) {
      const result = await userService.findUserById(id);

      if (!result.success || !result.data) {
        return null;
      }

      return {
        id: result.data.id,
        name: result.data.data.username,
        email: result.data.data.email,
        emailVerified: null,
      };
    },

    async getUserByEmail(email) {
      try {
        const users = await db.users.query($ => $.field("email").eq(email));

        if (users.length === 0) {
          return null;
        }

        const user = users[0];
        return {
          id: user.ref.id,
          name: user.data.username,
          email: user.data.email,
          emailVerified: null,
        };
      } catch (error) {
        console.error("Error getting user by email:", error);
        return null;
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      try {
        const accounts = await db.accounts.query($ =>
          $.field("providerAccountId")
            .eq(providerAccountId)
            .and($.field("provider").eq(provider))
        );

        if (accounts.length === 0) {
          return null;
        }

        const { userId } = accounts[0].data;
        const result = await userService.findUserById(userId);

        if (!result.success || !result.data) {
          return null;
        }

        return {
          id: result.data.id,
          name: result.data.data.username,
          email: result.data.data.email,
          emailVerified: null,
        };
      } catch (error) {
        console.error("Error getting user by account:", error);
        return null;
      }
    },

    async updateUser(user) {
      const result = await userService.update(
        user.id,
        user.name || undefined,
        user.email || undefined
      );

      if (!result.success || !result.data) {
        throw new Error(result.message);
      }

      return {
        id: result.data.id,
        name: result.data.data.username,
        email: result.data.data.email,
        emailVerified: null,
      };
    },

    async linkAccount(account) {
      try {
        const accountRef = await db.accounts.add({
          userId: account.userId,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          type: account.type,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        });

        return {
          id: accountRef.id,
          ...account,
        };
      } catch (error) {
        console.error("Error linking account:", error);
        throw error;
      }
    },

    async createSession(session) {
      try {
        const sessionRef = await db.sessions.add({
          userId: session.userId,
          expires: session.expires,
          sessionToken: session.sessionToken,
        });

        return {
          id: sessionRef.id,
          ...session,
        };
      } catch (error) {
        console.error("Error creating session:", error);
        throw error;
      }
    },

    async getSessionAndUser(sessionToken) {
      try {
        const sessions = await db.sessions.query($ =>
          $.field("sessionToken").eq(sessionToken)
        );

        if (sessions.length === 0) {
          return null;
        }

        const session = sessions[0];
        const { userId } = session.data;

        const result = await userService.findUserById(userId);

        if (!result.success || !result.data) {
          return null;
        }

        return {
          session: {
            id: session.ref.id,
            sessionToken: session.data.sessionToken,
            userId: session.data.userId,
            expires: session.data.expires,
          },
          user: {
            id: result.data.id,
            name: result.data.data.username,
            email: result.data.data.email,
            emailVerified: null,
          },
        };
      } catch (error) {
        console.error("Error getting session and user:", error);
        return null;
      }
    },

    async updateSession(session) {
      try {
        const sessions = await db.sessions.query($ =>
          $.field("sessionToken").eq(session.sessionToken)
        );

        if (sessions.length === 0) {
          return null;
        }

        const sessionDoc = sessions[0];

        await db.sessions.update(sessionDoc.ref.id, {
          expires: session.expires,
        });

        const updatedSession = await db.sessions.get(sessionDoc.ref.id);

        return {
          id: updatedSession.ref.id,
          sessionToken: updatedSession.data.sessionToken,
          userId: updatedSession.data.userId,
          expires: updatedSession.data.expires,
        };
      } catch (error) {
        console.error("Error updating session:", error);
        return null;
      }
    },

    async deleteSession(sessionToken) {
      try {
        const sessions = await db.sessions.query($ =>
          $.field("sessionToken").eq(sessionToken)
        );

        if (sessions.length > 0) {
          await db.sessions.remove(sessions[0].ref.id);
        }
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    },

    async createVerificationToken(verificationToken) {
      try {
        await db.verificationTokens.add({
          identifier: verificationToken.identifier,
          token: verificationToken.token,
          expires: verificationToken.expires,
        });

        return verificationToken;
      } catch (error) {
        console.error("Error creating verification token:", error);
        throw error;
      }
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const tokens = await db.verificationTokens.query($ =>
          $.field("identifier").eq(identifier).and($.field("token").eq(token))
        );

        if (tokens.length === 0) {
          return null;
        }

        const verificationToken = tokens[0];
        const result = {
          identifier: verificationToken.data.identifier,
          token: verificationToken.data.token,
          expires: verificationToken.data.expires,
        };

        await db.verificationTokens.remove(verificationToken.ref.id);

        return result;
      } catch (error) {
        console.error("Error using verification token:", error);
        return null;
      }
    },
  };
}
