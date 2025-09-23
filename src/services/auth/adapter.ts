import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  UserTable,
  AccountTable,
  SessionTable,
  VerificationTokenTable,
  UserType,
} from "@/services/database/postgres/schema";
import { db } from "@/services/database/postgres/db";

export const Adapter = DrizzleAdapter(db, {
  usersTable: UserType,
  accountsTable: AccountTable,
  sessionsTable: SessionTable,
  verificationTokensTable: VerificationTokenTable,
});
