import type { User, QueryResponse } from "@/types";

import { AxiosService } from ".";

const API_BASE_URL = "http://localhost:3000";
const api = new AxiosService(API_BASE_URL, true);

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

export const fetchUserQuery = async (uid: string) => {
  return await api.get(`/api/query/user?uid=${uid}`);
};

export const createQuery = async (data: CreateQueryPayload) => {
  return await api.post(`/api/query`, data);
};

export const patchUserQuery = async (uid: string, data: PatchQueryPayload) => {
  return await api.patch(`/api/query/user?uid=${uid}`, data);
};

export const likeQuery = async (queryId: string, uid: string) => {
  return await api.patch(`/api/query/likes`, {
    queryId,
    uid,
    like: true,
  });
};

export const unlikeQuery = async (queryId: string, uid: string) => {
  return await api.patch(`/api/query/likes`, {
    queryId,
    uid,
    like: false,
  });
};

export const getUserQueries = async (
  uid: string
): Promise<UserQueryResponse> => {
  return await api.get(`/api/query/user?uid=${uid}`);
};

export const fetchUserStarredQueries = async (uid: string) => {
  return await api.get(`/api/query/star?uid=${uid}`);
};
