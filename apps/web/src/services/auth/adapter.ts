import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  db,
  users,
  nextauthAccounts,
  nextauthSessions,
  nextauthVerificationTokens,
} from "@sandworm/database";

export const AuthAdapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: nextauthAccounts,
  sessionsTable: nextauthSessions,
  verificationTokensTable: nextauthVerificationTokens,
});
