import "@/services/firebase";
import * as admin from "firebase-admin";

import { UserService } from "@/services/firebase/db/UserService";

jest.setTimeout(100000);

describe("UserService", () => {
  beforeAll(async () => {
    // Clean up the database before running tests
    await UserService.deleteAll();
  });

  afterAll(async () => {
    await admin.app().delete();
  });

  it("should create a new user", async () => {
    const result = await UserService.create(
      "testuser",
      "testuser@example.com",
      "password123"
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data.username).toBe("testuser");
      expect(result.data.email).toBe("testuser@example.com");
    }
  });

  it("should retrieve a user by ID", async () => {
    // First, create a user
    const createResult = await UserService.create(
      "findUserTest",
      "find@example.com",
      "password123"
    );
    if (createResult.success) {
      expect(createResult.success).toBe(true);

      // Now, retrieve the created user by ID
      const userResult = await UserService.findUserById(createResult.data.id);

      expect(userResult.success).toBe(true);
      if (userResult.success) {
        expect(userResult.data.username).toBe("findUserTest");
        expect(userResult.data.email).toBe("find@example.com");
      }
    }
  });

  it("should update a user", async () => {
    // First, create a user
    const createResult = await UserService.create(
      "updateUser",
      "update@example.com",
      "password123"
    );
    if (createResult.success) {
      expect(createResult.success).toBe(true);

      // Update the user
      const updatedResult = await UserService.update(
        createResult.data.id,
        "updatedUser",
        "updated@example.com"
      );

      expect(updatedResult.success).toBe(true);
      if (updatedResult.success) {
        expect(updatedResult.data.username).toBe("updatedUser");
        expect(updatedResult.data.email).toBe("updated@example.com");
      }
    }
  });

  it("should delete a user", async () => {
    // First, create a user
    const createResult = await UserService.create(
      "deleteUser",
      "delete@example.com",
      "password123"
    );
    if (createResult.success) {
      expect(createResult.success).toBe(true);

      // Delete the user
      const deleteResult = await UserService.delete(createResult.data.id);

      expect(deleteResult.success).toBe(true);

      // Try to find the user again (should not be found)
      const userResult = await UserService.findUserById(createResult.data.id);
      expect(userResult.success).toBe(false);
      if (!userResult.success) {
        expect(userResult.code).toBe("NOT_FOUND");
      }
    }
  });

  it("should verify the password correctly", async () => {
    const password = "password123";
    const hashedPassword = await UserService.hashPassword(password);

    const isPasswordValid = await UserService.verify(password, hashedPassword);
    expect(isPasswordValid).toBe(true);

    const isPasswordInvalid = await UserService.verify(
      "wrongPassword",
      hashedPassword
    );
    expect(isPasswordInvalid).toBe(false);
  });

  it("should fail when attempting to find a non-existent user", async () => {
    const result = await UserService.findUserById("nonexistentid");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("NOT_FOUND");
    }
  });

  it("should not create a user with missing fields", async () => {
    const result = await UserService.create("", "", "");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe("MISSING_FIELDS");
    }
  });

  it("should not update user to an invalid username", async () => {
    // Create a user first
    const createResult = await UserService.create(
      "validUser",
      "valid@example.com",
      "password123"
    );
    if (createResult.success) {
      expect(createResult.success).toBe(true);

      // Try to update the user to an invalid username (empty)
      const updateResult = await UserService.update(
        createResult.data.id,
        "",
        "valid@example.com"
      );

      expect(updateResult.success).toBe(false);
      if (!updateResult.success) {
        expect(updateResult.code).toBe("INVALID_USERNAME");
      }
    }
  });

  it("should handle invalid password hash during verification", async () => {
    const password = "password123";
    const invalidHash = "invalidHashValue";

    const isPasswordValid = await UserService.verify(password, invalidHash);
    expect(isPasswordValid).toBe(false);
  });
});
