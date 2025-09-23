import { DrizzleAdapter } from "@auth/drizzle-adapter";

import {
  UserTable,
  AccountTable,
  SessionTable,
  VerificationTokenTable,
} from "@/services/database/postgres/schema";
import { db } from "@/services/database/postgres/db";

export const AuthAdapter = DrizzleAdapter(db, {
  usersTable: UserTable,
  accountsTable: AccountTable,
  sessionsTable: SessionTable,
  verificationTokensTable: VerificationTokenTable,
});
