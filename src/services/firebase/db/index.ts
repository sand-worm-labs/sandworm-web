import type { Typesaurus } from "typesaurus";
import { schema } from "typesaurus";

import type { User } from "./users/UserService";
import type { Query, QueryUpdates } from "./QueryService";

export interface Account {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface Session {
  userId: string;
  expires: Date;
  sessionToken: string;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export type ServiceResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error?: string;
      message: string;
      code: string;
      details?: any;
    };

export class DataResult {
  static success<T>(data: T): ServiceResult<T> {
    return { success: true, data };
  }

  static failure<T>(
    message: string,
    code: string,
    details?: any
  ): ServiceResult<T> {
    return { success: false, message, code, details };
  }
}

export function createSuccessResult<T>(payload: T): ServiceResult<T> {
  return { success: true, data: payload };
}

export function createFailureResult<T>(
  message: string,
  code: string,
  details?: any
): ServiceResult<T> {
  return { success: false, message, code, details };
}

export const db = schema($ => ({
  users: $.collection<User>(),
  accounts: $.collection<Account>(),
  sessions: $.collection<Session>(),
  verificationTokens: $.collection<VerificationToken>(),
  querys: $.collection<Query>().sub({
    updates: $.collection<QueryUpdates>(),
  }),
}));

export type Schema = Typesaurus.Schema<typeof db>;

export type SchemaKeys = keyof Schema;
export type SubSchemas = Schema[SchemaKeys]["sub"];
export type SubSchemaKeys = keyof SubSchemas;
export type Document = Schema[SchemaKeys]["Doc"];
export type SubDocument = SubSchemas[SubSchemaKeys]["Doc"];

export type Result<T> = {
  id: string;
} & T & {
    exist: boolean;
  };

export function toResult<U>(doc: Document | SubDocument | null): Result<U> {
  return { id: doc?.ref?.id as string, ...(doc?.data as U), exist: !!doc };
}

export function toResults<U>(docs: Document[] | SubDocument[]): Result<U>[] {
  return docs.map(doc => toResult<U>(doc));
}
