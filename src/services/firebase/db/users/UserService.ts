import type { Result, Schema, ServiceResult } from "@/services/firebase/db";
import { DataResult, db, toResult } from "@/services/firebase/db";

export interface SocialLinks {
  telegram: string;
  twitter: string;
  github: string;
  discord: string;
  email: string;
  instagram: string;
  warpcast: string;
}

export interface Status {
  text: string;
  timestamp: number;
}

export interface Wallet {
  chain: string;
  address: string;
}

export interface User {
  username: string;
  email: string;
  socialLinks?: SocialLinks;
  status?: Status;
  wallets?: Wallet[];
  stars: number;
  forks: number;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  emailVerified?: Date;
  image?: string;
}

export type UserDoc = Schema["users"]["Doc"];
export type UserResult = Result<User>;

export class UserService {
  static async findUserById(id: string): Promise<ServiceResult<UserResult>> {
    try {
      const userSnapshot = await db.users.get(db.users.id(id));
      if (!userSnapshot)
        return DataResult.failure("User not found.", "NOT_FOUND");
      return DataResult.success(toResult<User>(userSnapshot));
    } catch (error) {
      return DataResult.failure(
        "Failed to retrieve user.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async create(
    username: string,
    email: string,
    name?: string,
    image?: string
  ): Promise<ServiceResult<UserResult>> {
    if (!username || !email) {
      return DataResult.failure("Missing required fields.", "MISSING_FIELDS");
    }
    try {
      const ref = await db.users.add(() => ({
        username,
        email,
        name: name || username,
        image,
        createdAt: new Date(),
        updatedAt: new Date(),
        stars: 0,
        forks: 0,
      }));

      const userSnapshot = await db.users.get(ref.id);
      if (!userSnapshot)
        return DataResult.failure(
          "Failed to retrieve created user.",
          "DB_RETRIEVAL_ERROR"
        );
      return DataResult.success(toResult<User>(userSnapshot));
    } catch (error) {
      return DataResult.failure(
        "Error creating user.",
        "DB_INSERT_ERROR",
        error
      );
    }
  }

  static async update(
    id: string,
    userData: Partial<User>
  ): Promise<ServiceResult<UserResult>> {
    try {
      if (!id) return DataResult.failure("Missing user ID.", "MISSING_FIELDS");

      // Only validate username if it's being updated
      if (userData.username !== undefined && userData.username.trim() === "") {
        return DataResult.failure(
          "Username cannot be empty.",
          "MISSING_USERNAME"
        );
      }

      const foundUser = await db.users.get(db.users.id(id));
      if (!foundUser) return DataResult.failure("User not found.", "NOT_FOUND");

      await foundUser.update({
        ...userData,
        updatedAt: new Date(),
      });

      const userSnapshot = await db.users.get(db.users.id(id));
      if (!userSnapshot)
        return DataResult.failure(
          "Failed to retrieve updated user.",
          "DB_RETRIEVAL_ERROR"
        );
      return DataResult.success(toResult<User>(userSnapshot));
    } catch (error) {
      return DataResult.failure(
        "Error updating user.",
        "DB_UPDATE_ERROR",
        error
      );
    }
  }

  static async delete(uid: string): Promise<ServiceResult<boolean>> {
    try {
      const userSnapshot = await db.users.get(db.users.id(uid));
      if (!userSnapshot)
        return DataResult.failure("User not found.", "NOT_FOUND");
      await db.users.remove(db.users.id(uid));
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure(
        "Error deleting user.",
        "DB_DELETE_ERROR",
        error
      );
    }
  }

  static async deleteAll(): Promise<ServiceResult<boolean>> {
    try {
      const users = await db.users.all();
      if (!users.length) return DataResult.success(true);
      await Promise.allSettled(users.map(user => db.users.remove(user.ref.id)));
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure(
        "Failed to delete users.",
        "DB_DELETE_ERROR",
        error
      );
    }
  }

  // NextAuth.js Adapter Methods
  static async findUserByEmail(
    email: string
  ): Promise<ServiceResult<UserResult>> {
    try {
      const usersSnap = await db.users.query($ => $.field("email").eq(email));

      if (usersSnap.length === 0) {
        return DataResult.failure("User not found.", "NOT_FOUND");
      }

      return DataResult.success(toResult<User>(usersSnap[0]));
    } catch (error) {
      return DataResult.failure(
        "Failed to retrieve user by email.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async findUserByAccount(
    provider: string,
    providerAccountId: string
  ): Promise<ServiceResult<UserResult>> {
    try {
      const accountsSnap = await db.accounts.query($ => [
        $.field("provider").eq(provider),
        $.field("providerAccountId").eq(providerAccountId),
      ]);

      if (accountsSnap.length === 0) {
        return DataResult.failure("Account not found.", "NOT_FOUND");
      }

      const account = accountsSnap[0].data;

      return await this.findUserById(account.userId);
    } catch (error) {
      return DataResult.failure(
        "Failed to retrieve user by account.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }
}
