import type { Adapter } from "next-auth/adapters";
import {
  UserService,
  AccountService,
  SessionService,
  VerificationService,
} from "../firebase/db/users";

export function FirebaseAuthAdapter(): Adapter {
  return {
    async createUser(user) {
      const result = await UserService.create(
        user.name || user.email.split("@")[0],
        user.email,
        user.name || "",
        user.image || ""
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      const userData = result.data;

      return {
        id: userData.id || "",
        name: userData.name || userData.username,
        email: userData.email,
        emailVerified: userData.emailVerified || null,
        image: userData.image,
      };
    },

    async getUser(id) {
      const result = await UserService.findUserById(id);

      if (!result.success) {
        return null;
      }

      const userData = result.data;

      return {
        id: userData.id || "",
        name: userData.name || userData.username,
        email: userData.email,
        emailVerified: userData.emailVerified || null,
        image: userData.image,
      };
    },

    async getUserByEmail(email) {
      const result = await UserService.findUserByEmail(email);

      if (!result.success) {
        return null;
      }

      const userData = result.data;

      return {
        id: userData.id || "",
        name: userData.name || userData.username,
        email: userData.email,
        emailVerified: userData.emailVerified || null,
        image: userData.image,
      };
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const result = await UserService.findUserByAccount(
        provider,
        providerAccountId
      );

      if (!result.success) {
        return null;
      }

      const userData = result.data;

      return {
        id: userData.id || "",
        name: userData.name || userData.username,
        email: userData.email,
        emailVerified: userData.emailVerified || null,
        image: userData.image,
      };
    },

    async updateUser(user) {
      const result = await UserService.update(user.id, {
        name: user.name || "",
        email: user.email,
        emailVerified: user.emailVerified || undefined,
        image: user.image || undefined,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      const userData = result.data;

      return {
        id: userData.id || "",
        name: userData.name || userData.username,
        email: userData.email,
        emailVerified: userData.emailVerified || null,
        image: userData.image,
      };
    },

    async linkAccount(account) {
      const result = await AccountService.linkAccount(account.userId, account);

      if (!result.success) {
        throw new Error(result.message);
      }

      return account;
    },

    async createSession({ sessionToken, userId, expires }) {
      const result = await SessionService.createSession(
        userId,
        sessionToken,
        expires
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        sessionToken,
        userId,
        expires,
      };
    },

    async getSessionAndUser(sessionToken) {
      const result = await SessionService.getSessionAndUser(sessionToken);

      if (!result.success) {
        return null;
      }

      return result.data;
    },

    async updateSession({ sessionToken, ...data }) {
      const result = await SessionService.updateSession(sessionToken, data);

      if (!result.success) {
        return null;
      }

      return result.data;
    },

    async deleteSession(sessionToken) {
      await SessionService.deleteSession(sessionToken);
    },

    async createVerificationToken({ identifier, token, expires }) {
      const result = await VerificationService.createVerificationToken(
        identifier,
        token,
        expires
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        identifier,
        token,
        expires,
      };
    },

    async useVerificationToken({ identifier, token }) {
      const result = await VerificationService.useVerificationToken(
        identifier,
        token
      );

      if (!result.success) {
        return null;
      }

      return result.data;
    },
  };
}
