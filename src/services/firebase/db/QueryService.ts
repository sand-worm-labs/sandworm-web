import type { Typesaurus } from "typesaurus";

import type { Result, Schema, ServiceResult } from "@/services/firebase/db";
import { db, toResult } from "@/services/firebase/db";

export interface Query {
  title: string;
  description: string;
  creator: string;
  private: boolean;
  query: string;
  tags: string[];
  stared_by: string[];
  forked_from: string;
  forks: string[];
  forked: boolean;
  createdAt: Typesaurus.ServerDate;
  updatedAt: Typesaurus.ServerDate;
}

export interface QueryUpdates {
  query: string;
  createdAt: Typesaurus.ServerDate;
}

export type QueryDoc = Schema["querys"]["Doc"];
export type QueryUpdateDoc = Schema["querys"]["sub"]["updates"]["Doc"];
export type QueryResult = Result<Query>;
export type QueryUpdatesResult = Result<QueryUpdates>;

export class QueryService {
  static async findAllUserQuery(
    uid: string
  ): Promise<ServiceResult<QueryResult[]>> {
    try {
      const queries = await db.querys.query($ =>
        $.field("creator").eq(String(uid))
      );

      if (queries.length === 0) {
        return {
          success: false,
          message: "No queries found for the user.",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        data: queries.map((query: QueryDoc) => toResult<QueryResult>(query)),
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to retrieve user queries.",
        code: "DB_QUERY_ERROR",
        details: error,
      };
    }
  }

  static async create(
    title: string,
    description: string,
    creator: string,
    privateQuery: boolean,
    query: string,
    tags: string[]
  ): Promise<ServiceResult<QueryResult>> {
    try {
      const ref = await db.querys.add($ => ({
        title,
        description,
        creator,
        private: privateQuery,
        query,
        tags,
        stared_by: [],
        forked_from: "",
        forks: [],
        createdAt: $.serverDate(),
        updatedAt: $.serverDate(),
        forked: false,
      }));

      await db.querys(ref.id).updates.add($ => ({
        query,
        createdAt: $.serverDate(),
      }));

      const querySnapshot = await db.querys.get(ref.id);
      if (!querySnapshot) {
        return {
          success: false,
          message: "Failed to retrieve created query.",
          code: "DB_RETRIEVAL_ERROR",
        };
      }

      return {
        success: true,
        data: toResult<Query>(querySnapshot),
      };
    } catch (error) {
      return {
        success: false,
        message: "Error creating query.",
        code: "DB_INSERT_ERROR",
        details: error,
      };
    }
  }

  static async update(
    queryId: string,
    title: string,
    description: string,
    creator: string,
    privateQuery: boolean,
    query: string,
    tags: string[]
  ): Promise<ServiceResult<QueryResult>> {
    try {
      const foundQuery = await db.querys.get(db.querys.id(queryId));
      if (!foundQuery) {
        return {
          success: false,
          message: "Query not found.",
          code: "NOT_FOUND",
        };
      }

      await foundQuery.update($ => ({
        title,
        description,
        creator,
        private: privateQuery,
        query,
        tags,
        updatedAt: $.serverDate(),
      }));

      await db.querys(db.querys.id(queryId)).updates.add($ => ({
        query,
        createdAt: $.serverDate(),
      }));

      const querySnapshot = await db.querys.get(db.querys.id(queryId));
      if (!querySnapshot) {
        return {
          success: false,
          message: "Failed to retrieve updated query.",
          code: "DB_RETRIEVAL_ERROR",
        };
      }

      return {
        success: true,
        data: toResult<Query>(querySnapshot),
      };
    } catch (error) {
      return {
        success: false,
        message: "Error updating query.",
        code: "DB_UPDATE_ERROR",
        details: error,
      };
    }
  }

  /**
   * Retrieves all query updates for a given query.
   * @param queryId The query ID to retrieve updates for.
   * @returns A ServiceResult containing an array of QueryUpdates if successful, otherwise
   * an error message and code.
   */
  static async getQueryUpdates(
    queryId: string
  ): Promise<ServiceResult<QueryUpdates[]>> {
    try {
      const queryDoc = await db.querys.get(db.querys.id(queryId));
      if (!queryDoc) {
        return {
          success: false,
          message: "Query not found.",
          code: "NOT_FOUND",
        };
      }

      const updatesSnapshot = await db
        .querys(db.querys.id(queryId))
        .updates.all();

      return {
        success: true,
        data: updatesSnapshot.map((update: QueryUpdateDoc) =>
          toResult<QueryUpdatesResult>(update)
        ),
      };
    } catch (error) {
      return {
        success: false,
        message: "Error retrieving query updates.",
        code: "DB_FETCH_ERROR",
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }

  static async deleteAll(): Promise<ServiceResult<boolean>> {
    try {
      const queries = await db.querys.all();

      if (queries.length === 0) {
        return {
          success: true,
          data: true,
        };
      }

      // Batch delete for better performance
      await Promise.allSettled(
        queries.map(query => db.querys.remove(query.ref.id))
      );

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to delete queries.",
        code: "DB_DELETE_ERROR",
        details: error instanceof Error ? error.message : error,
      };
    }
  }
}
