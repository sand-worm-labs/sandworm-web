import type { Typesaurus } from "typesaurus";

import type { Result, Schema, ServiceResult } from "@/services/firebase/db";
import { db, toResult } from "@/services/firebase/db";

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
  socialLinks?: SocialLinks;
  status?: Status;
  wallets?: Wallet[];
  stars: number;
  forks: number;
  createdAt: Typesaurus.ServerDate;
  updatedAt: Typesaurus.ServerDate;
}

export type UserDoc = Schema["users"]["Doc"];
export type UserResult = Result<User>;

export class UserService {
  /**
   * Finds a user by their ID.
   * @param id The user ID.
   * @returns ServiceResult<UserResult> The found user or an error message.
   */
  static async findUserById(id: string): Promise<ServiceResult<UserResult>> {
    try {
      const userSnapshot = await db.users.get(db.users.id(id));
      if (!userSnapshot) {
        return {
          success: false,
          message: "User not found.",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        data: toResult<User>(userSnapshot),
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to retrieve user.",
        code: "DB_QUERY_ERROR",
        details: error,
      };
    }
  }

  /**
   * Creates a new user.
   * @param username The user's username.
   * @param email The user's email.
   * @returns ServiceResult<UserResult> The created user or an error message.
   */
  static async create(
    username: string,
    email: string
  ): Promise<ServiceResult<UserResult>> {
    try {
      const ref = await db.users.add($ => ({
        username,
        email,
        createdAt: $.serverDate(),
        updatedAt: $.serverDate(),
        stars: 0,
        forks: 0,
      }));

      const userSnapshot = await db.users.get(ref.id);
      if (!userSnapshot) {
        return {
          success: false,
          message: "Failed to retrieve created user.",
          code: "DB_RETRIEVAL_ERROR",
        };
      }

      return {
        success: true,
        data: toResult<User>(userSnapshot),
      };
    } catch (error) {
      return {
        success: false,
        message: "Error creating user.",
        code: "DB_INSERT_ERROR",
        details: error,
      };
    }
  }

  /**
   * Updates an existing user.
   * @param id The user ID to update.
   * @param username The new username.
   * @param email The new email.
   * @returns ServiceResult<UserResult> The updated user or an error message.
   */
  static async update(
    id: string,
    username: string,
    email: string
  ): Promise<ServiceResult<UserResult>> {
    try {
      const foundUser = await db.users.get(db.users.id(id));
      if (!foundUser) {
        return {
          success: false,
          message: "User not found.",
          code: "NOT_FOUND",
        };
      }

      await foundUser.update($ => ({
        username,
        email,
        updatedAt: $.serverDate(),
      }));

      const userSnapshot = await db.users.get(db.users.id(id));
      if (!userSnapshot) {
        return {
          success: false,
          message: "Failed to retrieve updated user.",
          code: "DB_RETRIEVAL_ERROR",
        };
      }

      return {
        success: true,
        data: toResult<User>(userSnapshot),
      };
    } catch (error) {
      return {
        success: false,
        message: "Error updating user.",
        code: "DB_UPDATE_ERROR",
        details: error,
      };
    }
  }

  /**
   * Deletes a user by their ID.
   * @param uid The user ID to delete.
   * @returns ServiceResult<boolean> True if the deletion was successful, false otherwise.
   */
  static async delete(uid: string): Promise<ServiceResult<boolean>> {
    try {
      const userSnapshot = await db.users.get(db.users.id(uid));
      if (!userSnapshot) {
        return {
          success: false,
          message: "User not found.",
          code: "NOT_FOUND",
        };
      }

      await db.users.remove(db.users.id(uid));

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error deleting user.",
        code: "DB_DELETE_ERROR",
        details: error,
      };
    }
  }
}
