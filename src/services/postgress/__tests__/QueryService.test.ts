/* eslint-disable import/no-extraneous-dependencies */
import "@/services/postgress";
import * as admin from "firebase-admin";
import { expect } from "@jest/globals";

import { QueryService } from "@/services/postgress/db/QueryService";

jest.setTimeout(100000);

describe("QueryService", () => {
  beforeAll(async () => {
    // await QueryService.deleteAll();
  });

  afterAll(async () => {
    await admin.app().delete();
  });

  it("should create a query in Firestore", async () => {
    const result = await QueryService.create(
      "Test Query",
      "A test query",
      "12345",
      false,
      "SELECT * FROM test",
      []
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
    }

    const queries = await QueryService.findAllUserQuery("12345");
    expect(queries.success).toBe(true);
    if (queries.success) {
      expect(queries.data.length).toBe(1);
    }
  });

  it("should retrieve all queries for a user", async () => {
    const queries = await QueryService.findAllUserQuery("12345");
    expect(queries.success).toBe(true);
    if (queries.success) {
      expect(queries.data.length).toBeGreaterThan(0);
    }
  });

  it("should update an existing query", async () => {
    const createResult = await QueryService.create(
      "Update Test",
      "Original description",
      "12345",
      false,
      "SELECT 1",
      []
    );

    expect(createResult.success).toBe(true);
    if (!createResult.success) return;

    const updatedResult = await QueryService.update(
      createResult.data.id,
      "Updated Query",
      "Updated description",
      "12345",
      false,
      "SELECT 2",
      []
    );

    expect(updatedResult.success).toBe(true);
    if (updatedResult.success) {
      expect(updatedResult.data.title).toBe("Updated Query");
      expect(updatedResult.data.description).toBe("Updated description");
    }
  });

  it("should get query updates on existing query", async () => {
    const createResult = await QueryService.create(
      "Update Test",
      "Original description",
      "12345",
      false,
      "SELECT 1",
      []
    );

    expect(createResult.success).toBe(true);
    if (!createResult.success) return;

    await QueryService.update(
      createResult.data.id,
      "Updated Query",
      "Updated description",
      "12345",
      false,
      "SELECT 2",
      []
    );

    await QueryService.update(
      createResult.data.id,
      "Updated Query",
      "Updated description",
      "12345",
      false,
      "SELECT * FROM (2 + 4)",
      []
    );

    await QueryService.update(
      createResult.data.id,
      "Updated Query",
      "Updated description",
      "12345",
      false,
      "SELECT * FROM (2 + 4) WHERE 1 = 1",
      []
    );

    const queryUpates = await QueryService.getQueryUpdates(
      createResult.data.id
    );

    expect(queryUpates.success).toBe(true);
    if (queryUpates.success) {
      expect(queryUpates.data.length).toBe(4);
    }
  });

  it("should delete all queries", async () => {
    const deleteResult = await QueryService.deleteAll();
    expect(deleteResult.success).toBe(true);

    const queries = await QueryService.findAllUserQuery("12345");
    expect(queries.success).toBe(false);
    if (!queries.success) {
      expect(queries.code).toBe("NOT_FOUND");
    }
  });
});
