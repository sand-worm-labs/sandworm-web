import {
  type VerificationToken,
  type ServiceResult,
  DataResult,
  db,
} from "@/services/postgress/db";

export class VerificationService {
  /**
   * Creates a new verification token in the database.
   *
   * @param identifier - The unique identifier for the user (typically an email).
   * @param token - The generated verification token.
   * @param expires - The expiration date of the token.
   * @returns A `ServiceResult` containing the created `VerificationToken` or an error message if the operation fails.
   */
  static async createVerificationToken(
    identifier: string,
    token: string,
    expires: Date
  ): Promise<ServiceResult<VerificationToken>> {
    try {
      await db.verificationTokens.add(() => ({ identifier, token, expires }));
      return DataResult.success({ identifier, token, expires });
    } catch (error) {
      return DataResult.failure(
        "Failed to create verification token.",
        "DB_INSERT_ERROR",
        error
      );
    }
  }

  /**
   * Uses a verification token by checking its validity and removing it after use.
   *
   * @param {string} identifier - The identifier associated with the token.
   * @param {string} token - The verification token to be validated.
   * @returns {Promise<ServiceResult<VerificationToken>>} - A result indicating success with the token data or failure with an error code.
   */
  static async useVerificationToken(
    identifier: string,
    token: string
  ): Promise<ServiceResult<VerificationToken>> {
    try {
      const tokensSnap = await db.verificationTokens.query($ => [
        $.field("identifier").eq(identifier),
        $.field("token").eq(token),
      ]);

      if (!tokensSnap.length)
        return DataResult.failure("Token not found.", "NOT_FOUND");

      const { data, ref } = tokensSnap[0];

      await db.verificationTokens.remove(ref.id);

      if (new Date(data.expires) < new Date()) {
        return DataResult.failure("Token expired.", "TOKEN_EXPIRED");
      }

      return DataResult.success(data);
    } catch (error) {
      return DataResult.failure(
        "Database query error.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }
}
