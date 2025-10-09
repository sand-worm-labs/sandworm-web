import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  db,
  UserTable,
  nextauthAccounts,
  nextauthSessions,
  nextauthVerificationTokens,
} from "@sandworm/database";

export const AuthAdapter = DrizzleAdapter(db, {
  usersTable: UserTable,
  accountsTable: nextauthAccounts,
  sessionsTable: nextauthSessions,
  verificationTokensTable: nextauthVerificationTokens,
});
