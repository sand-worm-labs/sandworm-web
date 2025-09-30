import { DrizzleAdapter } from "@auth/drizzle-adapter";

import {
  UserTable,
  nextauthAccounts,
  nextauthSessions,
  nextauthVerificationTokens,
} from "@sandworm/database/schemas";
import { db } from "@sandworm/database/db";

export const AuthAdapter = DrizzleAdapter(db, {
  usersTable: UserTable,
  accountsTable: nextauthAccounts,
  sessionsTable: nextauthSessions,
  verificationTokensTable: nextauthVerificationTokens,
});
