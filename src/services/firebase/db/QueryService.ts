import type { Typesaurus } from "typesaurus";

import type { Result, Schema, ServiceResult } from "@/services/firebase/db";
import { db, toResult, DataResult } from "@/services/firebase/db";

export interface Query {
  title: string;
  description: string;
  creator: string;
  private: boolean;
  query: string;
  tags: string[];
  stars: number;
  forks: number;
  stared_by: string[];
  forked_from: string;
  forked_by: string[];
  forked: boolean;
  createdAt: Typesaurus.ServerDate;
  updatedAt: Typesaurus.ServerDate;
}

export interface QueryWithUsername extends Query {
  username: string;
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
  static async findAll(
    lastId?: string,
    limit?: number
  ): Promise<ServiceResult<QueryWithUsername[]>> {
    try {
      let queries: QueryDoc[] = [];
      if (lastId) {
        const query = await db.querys.get(db.querys.id(lastId));
        if (!query) return DataResult.failure("Query not found.", "NOT_FOUND");
        queries = await db.querys.query($ => [
          $.field("private").eq(false),
          $.field($.docId()).order($.startAfter(query.ref.id)),
          $.limit(limit || 10),
        ]);
      } else {
        queries = await db.querys.query($ => [
          $.field("private").eq(false),
          $.limit(limit || 10),
        ]);
      }
      if (queries.length === 0)
        return DataResult.failure("No queries found.", "NOT_FOUND");
      const data = await Promise.all(queries.map(this.addUsernameToQuery));
      return DataResult.success(data);
    } catch (error) {
      return DataResult.failure(
        "Failed to retrieve queries.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async getByMostStars(
    lastId?: string,
    limit?: number
  ): Promise<ServiceResult<QueryWithUsername[]>> {
    try {
      let queries: QueryDoc[] = [];
      if (lastId) {
        const query = await db.querys.get(db.querys.id(lastId));
        if (!query) return DataResult.failure("Query not found.", "NOT_FOUND");
        queries = await db.querys.query($ => [
          $.field("stars").order("desc"),
          $.field("private").eq(false),
          $.field($.docId()).order($.startAfter(query.ref.id)),
          $.limit(limit || 10),
        ]);
      } else {
        queries = await db.querys.query($ => [
          $.field("stars").order("desc"),
          $.field("private").eq(false),
          $.limit(limit || 10),
        ]);
      }
      if (queries.length === 0)
        return DataResult.failure("No queries found.", "NOT_FOUND");
      const data = await Promise.all(queries.map(this.addUsernameToQuery));
      return DataResult.success(data);
    } catch (error) {
      return DataResult.failure(
        "Failed to retrieve queries.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async getByMostForks(
    lastId?: string,
    limit?: number
  ): Promise<ServiceResult<QueryWithUsername[]>> {
    try {
      let queries: QueryDoc[] = [];
      if (lastId) {
        const query = await db.querys.get(db.querys.id(lastId));
        if (!query) return DataResult.failure("Query not found.", "NOT_FOUND");
        queries = await db.querys.query($ => [
          $.field("private").eq(false),
          $.field("forks").order("desc"),
          $.field($.docId()).order($.startAfter(query.ref.id)),
          $.limit(limit || 10),
        ]);
      } else {
        queries = await db.querys.query($ => [
          $.field("private").eq(false),
          $.field("forks").order("desc"),
          $.limit(limit || 10),
        ]);
      }
      if (queries.length === 0)
        return DataResult.failure("No queries found.", "NOT_FOUND");
      const data = await Promise.all(queries.map(this.addUsernameToQuery));
      return DataResult.success(data);
    } catch (error) {
      return DataResult.failure(
        "Failed to retrieve queries.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async findAllUserQuery(
    uid: string,
    lastId?: string,
    limit?: number
  ): Promise<ServiceResult<QueryResult[]>> {
    try {
      let queries: QueryDoc[] = [];
      if (lastId) {
        const query = await db.querys.get(db.querys.id(lastId));
        if (!query) return DataResult.failure("Query not found.", "NOT_FOUND");
        queries = await db.querys.query($ => [
          $.field("private").eq(false),
          $.field($.docId()).order($.startAfter(query.ref.id)),
          $.field("creator").eq(String(uid)),
          $.limit(limit || 10),
        ]);
      } else {
        queries = await db.querys.query($ => [
          $.field("private").eq(false),
          $.field("creator").eq(String(uid)),
          $.limit(limit || 10),
        ]);
      }
      return queries.length === 0
        ? DataResult.failure("No queries found for the user.", "NOT_FOUND")
        : DataResult.success(
            queries.map((query: QueryDoc) => toResult<QueryResult>(query))
          );
    } catch (error) {
      return DataResult.failure(
        "Failed to retrieve user queries.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async create(
    title: string,
    description: string,
    creator: string,
    privateQuery: boolean,
    query: string,
    tags: string[],
    forkedFrom?: string,
    forked?: boolean
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
        forked_from: forkedFrom || "",
        forked_by: [],
        createdAt: $.serverDate(),
        updatedAt: $.serverDate(),
        forked: forked || false,
        stars: 0,
        forks: 0,
      }));

      await db.querys(ref.id).updates.add($ => ({
        query,
        createdAt: $.serverDate(),
      }));

      const querySnapshot = await db.querys.get(ref.id);
      return querySnapshot
        ? DataResult.success(toResult<Query>(querySnapshot))
        : DataResult.failure(
            "Failed to retrieve created query.",
            "DB_RETRIEVAL_ERROR"
          );
    } catch (error) {
      return DataResult.failure(
        "Error creating query.",
        "DB_INSERT_ERROR",
        error
      );
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
      if (!foundQuery)
        return DataResult.failure("Query not found.", "NOT_FOUND");

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
        : DataResult.failure(
            "Failed to retrieve updated query.",
            "DB_RETRIEVAL_ERROR"
          );
    } catch (error) {
      return DataResult.failure(
        "Error updating query.",
        "DB_UPDATE_ERROR",
        error
      );
    }
  }

  static async star(
    queryId: string,
    uid: string
  ): Promise<ServiceResult<QueryResult>> {
    try {
      const user = await db.users.get(db.users.id(uid));
      if (!user) return DataResult.failure("User not found.", "NOT_FOUND");
      const foundQuery = await db.querys.get(db.querys.id(queryId));
      if (!foundQuery)
        return DataResult.failure("Query not found.", "NOT_FOUND");
      if (foundQuery.data.stared_by.includes(uid))
        return DataResult.failure("Query already liked.", "NOT_FOUND");
      await foundQuery.update($ => $.field("stared_by").set($.arrayUnion(uid)));
      await foundQuery.update($ => $.field("stars").set($.increment(1)));
      await user.update($ => $.field("stars").set($.increment(1)));
      const querySnapshot = await db.querys.get(db.querys.id(queryId));
      return querySnapshot
        ? DataResult.success(toResult<Query>(querySnapshot))
        : DataResult.failure(
            "Failed to retrieve updated query.",
            "DB_RETRIEVAL_ERROR"
          );
    } catch (error) {
      return DataResult.failure(
        "Error liking query.",
        "DB_UPDATE_ERROR",
        error
      );
    }
  }

  static async unStar(
    queryId: string,
    uid: string
  ): Promise<ServiceResult<QueryResult>> {
    try {
      const user = await db.users.get(db.users.id(uid));
      if (!user) return DataResult.failure("User not found.", "NOT_FOUND");
      const foundQuery = await db.querys.get(db.querys.id(queryId));
      if (!foundQuery)
        return DataResult.failure("Query not found.", "NOT_FOUND");
      if (!foundQuery.data.stared_by.includes(uid))
        return DataResult.failure("Query already unliked.", "NOT_FOUND");
      await foundQuery.update($ =>
        $.field("stared_by").set($.arrayRemove(uid))
      );
      await foundQuery.update($ => $.field("stars").set($.increment(-1)));
      if (user.data.stars > 0) {
        await user.update($ => $.field("stars").set($.increment(-1)));
      }
      const querySnapshot = await db.querys.get(db.querys.id(queryId));
      return querySnapshot
        ? DataResult.success(toResult<Query>(querySnapshot))
        : DataResult.failure(
            "Failed to retrieve updated query.",
            "DB_RETRIEVAL_ERROR"
          );
    } catch (error) {
      return DataResult.failure(
        "Error liking query.",
        "DB_UPDATE_ERROR",
        error
      );
    }
  }

  static async fork(
    queryId: string,
    uid: string
  ): Promise<ServiceResult<QueryResult>> {
    try {
      const user = await db.users.get(db.users.id(uid));
      if (!user) return DataResult.failure("User not found.", "NOT_FOUND");
      const foundQuery = await db.querys.get(db.querys.id(queryId));
      if (!foundQuery)
        return DataResult.failure("Query not found.", "NOT_FOUND");
      if (foundQuery.data.forked_by.includes(uid))
        return DataResult.failure("Query already forked.", "NOT_FOUND");
      if (uid === foundQuery.data.creator)
        return DataResult.failure(
          "You cannot fork your own query.",
          "NOT_FOUND"
        );

      if (foundQuery.data.forked)
        return DataResult.failure("Query already forked.", "NOT_FOUND");

      if (foundQuery.data.forked_by.includes(uid))
        return DataResult.failure("Query already forked.", "NOT_FOUND");

      await foundQuery.update($ => $.field("forked_by").set($.arrayUnion(uid)));
      await foundQuery.update($ => $.field("forks").set($.increment(1)));
      await user.update($ => $.field("forks").set($.increment(1)));
      const forkedQuery = await this.create(
        foundQuery.data.title,
        foundQuery.data.description,
        uid,
        foundQuery.data.private,
        foundQuery.data.query,
        foundQuery.data.tags,
        queryId,
        true
      );
      return forkedQuery;
    } catch (error) {
      return DataResult.failure(
        "Error Forking query.",
        "DB_UPDATE_ERROR",
        error
      );
    }
  }

  static async getQueryUpdates(
    queryId: string
  ): Promise<ServiceResult<QueryUpdates[]>> {
    try {
      const queryDoc = await db.querys.get(db.querys.id(queryId));
      if (!queryDoc) return DataResult.failure("Query not found.", "NOT_FOUND");

      const updatesSnapshot: QueryUpdateDoc[] = await db
        .querys(db.querys.id(queryId))
        .updates.all();
      const data: QueryUpdates[] = updatesSnapshot.map(
        q => q.data as QueryUpdates
      );
      return DataResult.success(data);
    } catch (error) {
      return DataResult.failure(
        "Error retrieving query updates.",
        "DB_FETCH_ERROR",
        error
      );
    }
  }

  static async delete(queryId: string): Promise<ServiceResult<boolean>> {
    try {
      const foundQuery = await db.querys.get(db.querys.id(queryId));
      if (!foundQuery)
        return DataResult.failure("Query not found.", "NOT_FOUND");
      await db.querys.remove(db.querys.id(queryId));
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure(
        "Failed to delete query.",
        "DB_DELETE_ERROR",
        error
      );
    }
  }

  static async deleteAll(): Promise<ServiceResult<boolean>> {
    try {
      const queries = await db.querys.all();
      if (queries.length === 0) return DataResult.success(true);

      await Promise.allSettled(
        queries.map(query => db.querys.remove(query.ref.id))
      );
      return DataResult.success(true);
    } catch (error) {
      return DataResult.failure(
        "Failed to delete queries.",
        "DB_DELETE_ERROR",
        error
      );
    }
  }

  static async addUsernameToQuery(query: QueryDoc): Promise<QueryWithUsername> {
    try {
      const user = await db.users.get(db.users.id(query.data.creator));
      return {
        ...(query.data as Query),
        username: user?.data.username || "",
      };
    } catch (error) {
      throw new Error("Failed to retrieve username for query creator.");
    }
  }
}
