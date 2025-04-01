import { Typesaurus } from "typesaurus";

import type { Result, Schema, ServiceResult } from "@/services/firebase/db";
import { db, toResult, DataResult } from "@/services/firebase/db";

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
  static async findAll(): Promise<ServiceResult<QueryResult[]>> {
    try {
      const queries = await db.querys.all();
        return queries.length === 0
          ? DataResult.failure("No queries found.", "NOT_FOUND")
          : DataResult.success(queries.map((query: QueryDoc) => toResult<QueryResult>(query)));
      } catch (error) {
        return DataResult.failure("Failed to retrieve queries.", "DB_QUERY_ERROR", error);
    }
  }
  static async findAllUserQuery(uid: string): Promise<ServiceResult<QueryResult[]>> {
    try {
      const queries = await db.querys.query($ => $.field("creator").eq(String(uid)));
      return queries.length === 0
        ? DataResult.failure("No queries found for the user.", "NOT_FOUND")
        : DataResult.success(queries.map((query: QueryDoc) => toResult<QueryResult>(query)));
    } catch (error) {
      return DataResult.failure("Failed to retrieve user queries.", "DB_QUERY_ERROR", error);
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
      return querySnapshot
        ? DataResult.success(toResult<Query>(querySnapshot))
        : DataResult.failure("Failed to retrieve created query.", "DB_RETRIEVAL_ERROR");
    } catch (error) {
      return DataResult.failure("Error creating query.", "DB_INSERT_ERROR", error);
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
      if (!foundQuery) return DataResult.failure("Query not found.", "NOT_FOUND");

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
      return querySnapshot
        ? DataResult.success(toResult<Query>(querySnapshot))
        : DataResult.failure("Failed to retrieve updated query.", "DB_RETRIEVAL_ERROR");
    } catch (error) {
      return DataResult.failure("Error updating query.", "DB_UPDATE_ERROR", error);
    }
  }

  static async like(queryId: string, uid: string): Promise<ServiceResult<QueryResult>> {
      try {
        const foundQuery = await db.querys.get(db.querys.id(queryId));
        if (!foundQuery) return DataResult.failure("Query not found.", "NOT_FOUND");
        if(foundQuery.data.stared_by.includes(uid))  return DataResult.failure("Query already liked.", "NOT_FOUND");
        await foundQuery.update($ => ({
          stared_by: [...foundQuery.data.stared_by, uid],
        }));
        const querySnapshot = await db.querys.get(db.querys.id(queryId));
        return querySnapshot
          ? DataResult.success(toResult<Query>(querySnapshot))
          : DataResult.failure("Failed to retrieve updated query.", "DB_RETRIEVAL_ERROR");
      }
      catch (error) {
        return DataResult.failure("Error liking query.", "DB_UPDATE_ERROR", error);
    }
  }

  static async unlike(queryId: string, uid: string): Promise<ServiceResult<QueryResult>> {
    try {
      const foundQuery = await db.querys.get(db.querys.id(queryId));
      if (!foundQuery) return DataResult.failure("Query not found.", "NOT_FOUND");
      if(foundQuery.data.stared_by.includes(uid))  return DataResult.failure("Query already liked.", "NOT_FOUND");
      await foundQuery.update($ => ({
        stared_by: [...foundQuery.data.stared_by, uid],
      }));
      const querySnapshot = await db.querys.get(db.querys.id(queryId));
      return querySnapshot
        ? DataResult.success(toResult<Query>(querySnapshot))
        : DataResult.failure("Failed to retrieve updated query.", "DB_RETRIEVAL_ERROR");
    }
    catch (error) {
      return DataResult.failure("Error liking query.", "DB_UPDATE_ERROR", error);
  }
}


  static async getQueryUpdates(queryId: string): Promise<ServiceResult<QueryUpdates[]>> {
    try {
      const queryDoc = await db.querys.get(db.querys.id(queryId));
      if (!queryDoc) return DataResult.failure("Query not found.", "NOT_FOUND");

      const updatesSnapshot: QueryUpdateDoc[] = await db.querys(db.querys.id(queryId)).updates.all();
      const data: QueryUpdates[] = updatesSnapshot.map(q => q.data as QueryUpdates);
      return DataResult.success(data);
    } catch (error) {
      return DataResult.failure("Error retrieving query updates.", "DB_FETCH_ERROR", error);
    }
  }

  static async delete(queryId: string): Promise<ServiceResult<boolean>> {
    try {
      const foundQuery = await db.querys.get(db.querys.id(queryId));
      if (!foundQuery) return DataResult.failure("Query not found.", "NOT_FOUND");
      await db.querys.remove(db.querys.id(queryId));
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure("Failed to delete query.", "DB_DELETE_ERROR", error);   
    }
  }

  static async deleteAll(): Promise<ServiceResult<boolean>> {
    try {
      const queries = await db.querys.all();
      if (queries.length === 0) return DataResult.success(true);

      await Promise.allSettled(queries.map(query => db.querys.remove(query.ref.id)));
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure("Failed to delete queries.", "DB_DELETE_ERROR", error);
    }
  }
}
