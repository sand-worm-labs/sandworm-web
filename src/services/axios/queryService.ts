import type { User, QueryResponse, Query } from "@/types";

import { AxiosService } from ".";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not defined");
}
const api = new AxiosService(API_BASE_URL, true);
export const publicApi = new AxiosService(API_BASE_URL, false);

export interface PatchQueryPayload {
  title?: string;
  isPublic?: boolean;
}

interface UserQueryResponse {
  user: User;
  queries: QueryResponse;
}

export interface CreateQueryPayload {
  title: string;
  description: string;
  creator: string;
  privateQuery: boolean;
  query: string;
  tags: string[];
}

export interface QueryServiceResponse {
  queries: {
    page_items: Query[];
  };
  user: User;
}

export const fetchUserQuery = (uid: string): Promise<QueryServiceResponse> => {
  return api.get(`/api/query/user?uid=${uid}`);
};

export const fetchQueryUpdate = (id: string) => {
  return api.get(`/api/query/updates?queryId=${id}`);
};

export const createQuery = (data: CreateQueryPayload): Promise<Query> => {
  return api.post<Query>(`/api/query`, data);
};

export const patchUserQuery = (uid: string, data: PatchQueryPayload) => {
  return api.patch(`/api/query/user?uid=${uid}`, data);
};

export const forkQuery = (queryId: string, uid: string) => {
  return api.post(`/api/query/fork`, {
    uid,
    queryId,
  });
};

export const likeQuery = (queryId: string, uid: string) => {
  return api.patch(`/api/query/likes`, {
    queryId,
    uid,
    like: true,
  });
};

export const unlikeQuery = (queryId: string, uid: string) => {
  return api.patch(`/api/query/likes`, {
    queryId,
    uid,
    like: false,
  });
};

export const getUserQueries = (uid: string): Promise<UserQueryResponse> => {
  return api.get(`/api/query/user?uid=${uid}`);
};

export const fetchUserStarredQueries = (uid: string) => {
  return api.get(`/api/query/star?uid=${uid}`);
};

export const fetchQueryById = async (id: string) => {
  return publicApi.get(`/api/query/${id}`);
};
