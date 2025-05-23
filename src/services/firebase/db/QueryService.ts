import type { Typesaurus } from "typesaurus";

import type {
  PaginatedQueryResult,
  Result,
  Schema,
  ServiceResult,
} from "@/services/firebase/db";
import {
  toPaginatedResult,
  db,
  toResult,
  DataResult,
  getPaginationDetails,
} from "@/services/firebase/db";

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
  id: string;
  username: string;
  image: string;
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
  // Helper function for common query handling, pagination, and username addition
  static async getPaginatedQueries(
    queryType: "all" | "stars" | "forks" | "user_query" | "user_stared",
    limit: number,
    page: number,
    uid?: string
  ): Promise<PaginatedQueryResult<QueryWithUsername>> {
    try {
      const queryBuilder = ($: any) => {
        const base = [$.field("private").eq(false)];
        switch (queryType) {
          case "user_stared":
            base.push($.field("stared_by").contains(uid || ""));
            break;
          case "user_query":
            base.push($.field("creator").eq(uid || ""));
            break;
          case "stars":
            base.push($.field("stars").order("desc"));
            break;
          case "forks":
            base.push($.field("forks").order("desc"));
            break;
          case "all":
          default:
            break;
        }
        return base;
      };

      let queries: QueryDoc[] = await db.querys.query(queryBuilder);

      // Get pagination details
      const { totalRecords, totalPages, currentPage, nextPage, prevPage } =
        getPaginationDetails(queries.length, limit, page);

      // Paginate the results
      queries = this.paginate(queries, limit, page);

      if (queries.length === 0)
        return DataResult.failure("No queries found.", "NOT_FOUND");

      // Add username to each query
      const queriesWithUsername = await Promise.all(
        queries.map(this.addUsernameToQuery)
      );
      const data = toPaginatedResult(
        queriesWithUsername,
        totalRecords,
        currentPage,
        totalPages,
        nextPage,
        prevPage
      );

      return data;
    } catch (error) {
      return DataResult.failure(
        "Failed to retrieve queries.",
        "DB_QUERY_ERROR",
        error
      );
    }
  }

  static async findAll(
    page = 1,
    limit = 10
  ): Promise<PaginatedQueryResult<QueryWithUsername>> {
    console.log("findall is alive", page, limit);
    return this.getPaginatedQueries("all", limit, page);
  }

  static async getByMostStars(
    page = 1,
    limit = 10
  ): Promise<PaginatedQueryResult<QueryWithUsername>> {
    console.log("getByMostStar", page, limit);
    return this.getPaginatedQueries("stars", limit, page);
  }

  static async getByMostForks(
    page = 1,
    limit = 10
  ): Promise<PaginatedQueryResult<QueryWithUsername>> {
    console.log("getByMostForks", page, limit);
    return this.getPaginatedQueries("forks", limit, page);
  }

  static async findAllUserQuery(
    uid: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedQueryResult<QueryWithUsername>> {
    return this.getPaginatedQueries("user_query", limit, page, uid);
  }

  static async findAllUserStaredQuery(
    uid: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedQueryResult<QueryWithUsername>> {
    return this.getPaginatedQueries("user_stared", limit, page, uid);
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

  static async findOne(queryId: string): Promise<ServiceResult<QueryResult>> {
    try {
      const foundQuery = await db.querys.get(db.querys.id(queryId));

      if (!foundQuery)
        return DataResult.failure("Query not found.", "NOT_FOUND");

      return DataResult.success(toResult<Query>(foundQuery));
    } catch (error) {
      return DataResult.failure(
        "Error fetching query.",
        "DB_RETRIEVAL_ERROR",
        error
      );
    }
  }

  static async search(
    term: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedQueryResult<QueryWithUsername>> {
    try {
      const lowerTerm = term.toLowerCase();

      const queries: QueryDoc[] = await db.querys.query($ => [
        $.field("private").eq(false),
      ]);

      // Step 2: Filter by title, description, or username
      const filtered = await Promise.all(
        queries
          .filter(doc => {
            const q = doc.data;
            return (
              q.title.toLowerCase().includes(lowerTerm) ||
              q.description.toLowerCase().includes(lowerTerm)
            );
          })
          .map(this.addUsernameToQuery) // enrich during filtering
      );

      // Step 3: Paginate
      const { totalRecords, totalPages, currentPage, nextPage, prevPage } =
        getPaginationDetails(filtered.length, limit, page);

      const paginated = this.paginate(filtered, limit, page);

      if (paginated.length === 0)
        return DataResult.failure("No queries found.", "NOT_FOUND");

      return toPaginatedResult(
        paginated,
        totalRecords,
        currentPage,
        totalPages,
        nextPage,
        prevPage
      );
    } catch (error) {
      console.error("❌ DB search failed:", error);
      return DataResult.failure(
        "Failed to search queries.",
        "DB_QUERY_ERROR",
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
        id: query.ref.id,
        ...(query.data as Query),
        username: user?.data.username || "",
        image: user?.data.image || "",
      };
    } catch (error) {
      throw new Error("Failed to retrieve username for query creator.");
    }
  }

  static paginate<T>(array: T[], pageSize: number, pageNumber: number): T[] {
    if (pageNumber < 1) {
      throw new Error("Page number must be greater than or equal to 1");
    }

    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = pageNumber * pageSize;

    return array.slice(startIndex, endIndex);
  }
}
