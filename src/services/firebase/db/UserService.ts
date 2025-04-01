import type { Result, Schema, ServiceResult } from "@/services/firebase/db";
import { DataResult, db, toResult } from "@/services/firebase/db";

export interface SocialLinks {
  telegram: string;
  twitter: string;
  github: string;
  discord: string;
  email: string;
  instagram: string;
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
  password: string;
  socialLinks?: SocialLinks;
  status?: Status;
  wallets?: Wallet[];
  stars: number;
  forks: number;
  createdAt: Date;
  updatedAt: Date;
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
    password: string
  ): Promise<ServiceResult<UserResult>> {
    if (!username || !email || !password) {
      return DataResult.failure("Missing required fields.", "MISSING_FIELDS");
    }
    try {
      const ref = await db.users.add(() => ({
        username,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        stars: 0,
        forks: 0,
        password,
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
    username: string,
    email: string
  ): Promise<ServiceResult<UserResult>> {
    try {
      if (!id || !username || !email)
        return DataResult.failure("Missing required fields.", "MISSING_FIELDS");
      const foundUser = await db.users.get(db.users.id(id));
      if (!foundUser) return DataResult.failure("User not found.", "NOT_FOUND");

      await foundUser.update({
        username,
        email,
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
}
