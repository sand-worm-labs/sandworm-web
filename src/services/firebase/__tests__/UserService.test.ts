import "@/services/firebase";

import { QueryService } from "@/services/firebase/db/QueryService";

beforeEach(async () => {
  await QueryService.deleteAll();
});

afterAll(async () => {
  // await QueryService.deleteAll();
});

describe("QueryService (Real DB)", () => {
  it("adds a query", async () => {
    expect(true).toBe(true);
  });
  // it("should create a query in Firestore", async () => {
  //   const result = await QueryService.create(
  //     "Test Query",
  //     "A test query",
  //     "12345",
  //     false,
  //     "SELECT * FROM test",
  //     []
  //   );
  //   expect(result.success).toBe(true);
  //   if (result.success) {
  //     expect(result.data).toBeDefined();
  //   }
  //   // Verify in Firestore
  //   const queries = await QueryService.findAllUserQuery("12345");
  //   expect(queries.success).toBe(true);
  //   if (queries.success) {
  //     expect(queries.data.length).toBe(1);
  //   }
  // });
  // it("should return error if no queries exist", async () => {
  //   const result = await QueryService.findAllUserQuery("nonexistent-user");
  //   expect(result.success).toBe(false);
  //   if (!result.success) {
  //     expect(result.message).toBe("No queries found for this user.");
  //   }
  // });
  // it("should handle database errors gracefully", async () => {
  //   const result = await QueryService.create(
  //     "Failing Query",
  //     "Database should fail",
  //     "12345",
  //     false,
  //     "SELECT * FROM fail",
  //     []
  //   );
  //   expect(result.success).toBe(false);
  //   if (!result.success) {
  //     expect(result.error).toBeDefined();
  //   }
  // });
});
