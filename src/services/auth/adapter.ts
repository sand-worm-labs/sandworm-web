import { DrizzleAdapter } from "@auth/drizzle-adapter";

import {
  users,
  nextauthAccounts,
  nextauthSessions,
  nextauthVerificationTokens,
} from "@sandworm/database/schemas";
import { db } from "@sandworm/database/db";

export const AuthAdapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: nextauthAccounts,
  sessionsTable: nextauthSessions,
  verificationTokensTable: nextauthVerificationTokens,
});
