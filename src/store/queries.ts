import { create } from "zustand";

import { AxiosError } from "axios";
import { AxiosService } from "@/services/axios";
import type { Query } from "@/services/firebase/db/QueryService";

interface QueryStore {
  queries: Query[];
  isLoading: boolean;
  error: string | null;
  fetchQueries: () => Promise<void>;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const axiosService = new AxiosService(BASE_URL, false);

export const useQueryStore = create<QueryStore>(set => ({
  queries: [],
  isLoading: false,
  error: null,

  fetchQueries: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await axiosService.get<Query[]>("/api/queries");
      set({ queries: data, isLoading: false });
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      set({
        error: axiosError.message || "Failed to fetch queries",
        isLoading: false,
      });
    }
  },
}));
