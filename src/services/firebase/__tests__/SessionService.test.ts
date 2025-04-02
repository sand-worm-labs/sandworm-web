import "@/services/firebase";
import * as admin from "firebase-admin";

import { SessionService } from "@/services/firebase/db/users/SessionService"; // Adjust the import path accordingly
import { expect } from '@jest/globals';
import { UserService } from "../db/users";

jest.setTimeout(100000);

describe("SessionService", () => {
  const exampleSession = {
    userId: "12345",
    sessionToken: "abcdef1234567890",
    expires: new Date("2025-12-31T23:59:59Z"),
  };

  beforeAll(async () => {
    // Cleanup any existing session data before running tests
    await SessionService.deleteSession(exampleSession.sessionToken);
  });

  afterAll(async () => {
    // Cleanup after tests are done
    await SessionService.deleteSession(exampleSession.sessionToken);
  });

  it("should create a session", async () => {
    const createResult = await SessionService.createSession(
      exampleSession.userId,
      exampleSession.sessionToken,
      exampleSession.expires
    );
    expect(createResult.success).toBe(true);
    if (createResult.success) {
      expect(createResult.data).toBeDefined();
      expect(createResult.data.sessionToken).toBe(exampleSession.sessionToken);
    }
  });

  it("should retrieve a session and user", async () => {
    const createdUser = await UserService.create(
      "TestUser",
      "test@example",
      "LALA USER" 
    );
    if(createdUser.success){
        const createResult = await SessionService.createSession(
        createdUser.data.id,
        exampleSession.sessionToken,
        exampleSession.expires
        );

        expect(createResult.success).toBe(true);
        const result = await SessionService.getSessionAndUser(exampleSession.sessionToken);
        expect(result.success).toBe(true);
        if (result.success) {
        expect(result.data.session.sessionToken).toBe(exampleSession.sessionToken);
        expect(result.data.session.userId).toBe(createdUser.data.id);
        }
    }
    expect(createdUser.success).toBe(true);
  });

  it("should update an existing session", async () => {
    const createResult = await SessionService.createSession(
      exampleSession.userId,
      exampleSession.sessionToken,
      exampleSession.expires
    );

    expect(createResult.success).toBe(true);

    const updatedSession = {
      ...exampleSession,
      expires: new Date("2025-12-31T23:59:59Z"),
    };

    const updateResult = await SessionService.updateSession(
      exampleSession.sessionToken,
      { expires: updatedSession.expires }
    );

    expect(updateResult.success).toBe(true);
    if (updateResult.success) {
      expect(updateResult.data.expires).toEqual(updatedSession.expires);
    }
  });

  it("should delete a session", async () => {
    const createResult = await SessionService.createSession(
      exampleSession.userId,
      exampleSession.sessionToken,
      exampleSession.expires
    );

    expect(createResult.success).toBe(true);

    const deleteResult = await SessionService.deleteSession(exampleSession.sessionToken);
    expect(deleteResult.success).toBe(true);

    const getResult = await SessionService.getSessionAndUser(exampleSession.sessionToken);
    expect(getResult.success).toBe(false);
    if (!getResult.success) {
      expect(getResult.code).toBe("NOT_FOUND");
    }
  });
});
