import type { Typesaurus } from "typesaurus";
import { schema } from "typesaurus";

import type { User } from "./UserService";
import type { Query, QueryUpdates } from "./QueryService";
import type { SupportedChain } from "./SupportedEntitiesService";

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
  querys: $.collection<Query>().sub({
    updates: $.collection<QueryUpdates>(),
  }),
  chainSupports: $.collection<SupportedChain>(),
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
