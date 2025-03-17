import type { Typesaurus } from "typesaurus";
import bcrypt from "bcrypt";

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
  password: string;
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
   * Verifies a given password against a stored hashed password.
   * @param password The password input provided by the user.
   * @param hashedPassword The stored password (hashed) for comparison.
   * @returns A promise that resolves to a verification result message.
   */
  static async verify(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    // Comparing the hashed password
    const passwordMatched = await bcrypt.compare(password, hashedPassword);

    if (passwordMatched) {
      return true;
    }
    return false;
  }

  /**
   * Hashes a password using bcrypt.
   * @param password The password to hash.
   * @returns Promise<string> The hashed password.
   */
  static async hashPassword(password: string): Promise<string> {
    const hashedPassword = bcrypt.hash(password, 10);
    return hashedPassword;
  }

  /**
   * Creates a new user.
   * @param username The user's username.
   * @param email The user's email.
   * @returns ServiceResult<UserResult> The created user or an error message.
   */
  static async create(
    username: string,
    email: string,
    password: string
  ): Promise<ServiceResult<UserResult>> {
    if (!username || !email || !password) {
      return {
        success: false,
        message: "Missing required fields.",
        code: "MISSING_FIELDS",
      };
    }
    try {
      const ref = await db.users.add($ => ({
        username,
        email,
        createdAt: $.serverDate(),
        updatedAt: $.serverDate(),
        stars: 0,
        forks: 0,
        password,
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
      const validations = {
        id: !id && { message: "Missing ID.", code: "MISSING_ID" },
        username: !username && {
          message: "Missing Username.",
          code: "MISSING_USERNAME",
        },
        email: !email && { message: "Missing Email.", code: "MISSING_EMAIL" },
      };

      const error = Object.values(validations).find(Boolean);
      if (error) {
        return { success: false, message: error.message, code: error.code };
      }
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

  /**
   * Deletes all users from the database.
   * @returns ServiceResult<boolean> True if all users were successfully deleted, false otherwise.
   */
  static async deleteAll(): Promise<ServiceResult<boolean>> {
    try {
      // Retrieve all user documents
      const users = await db.users.all();

      // If no users exist, return success
      if (users.length === 0) {
        return {
          success: true,
          data: true,
        };
      }

      // Batch delete users for better performance
      await Promise.allSettled(users.map(user => db.users.remove(user.ref.id)));

      // Return success if batch delete is successful
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      // Return failure result with error details if an exception occurs
      return {
        success: false,
        message: "Failed to delete users.",
        code: "DB_DELETE_ERROR",
        details: error instanceof Error ? error.message : error,
      };
    }
  }
}
