import { AxiosService } from ".";

const API_BASE_URL = "http://localhost:3000";
const api = new AxiosService(API_BASE_URL, true);

export interface PatchQueryPayload {
  title?: string;
  isPublic?: boolean;
}

export const fetchUserQuery = async (uid: string) => {
  return await api.get(`/api/query/user?uid=${uid}`);
};

export const patchUserQuery = async (uid: string, data: PatchQueryPayload) => {
  return await api.patch(`/api/query/user?uid=${uid}`, data);
};

export const likeQuery = async (queryId: string) => {
  return await api.patch(`/api/query/likes`, { queryId });
};

export const unlikeQuery = async (queryId: string) => {
  return await api.patch(`/api/query/likes`, { queryId });
};
