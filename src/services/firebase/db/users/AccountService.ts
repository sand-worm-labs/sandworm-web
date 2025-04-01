import type { AdapterAccount } from "next-auth/adapters";

import { type ServiceResult, DataResult, db } from "@/services/firebase/db";

export class AccountService {
  static async linkAccount(
    userId: string,
    account: AdapterAccount
  ): Promise<ServiceResult<boolean>> {
    try {
      await db.accounts.add(() => ({
        userId,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        type: account.type,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state as string | undefined,
      }));

      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure(
        "Failed to link account.",
        "DB_INSERT_ERROR",
        error
      );
    }
  }
}
