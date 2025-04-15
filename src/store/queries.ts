import { create } from "zustand";
import axios from "axios";

import type { Query } from "@/types";

interface UserQueryStore {
  queries: Query[];
  isLoading: boolean;
  error: string | null;
  fetchUserQueries: (userId: string) => Promise<void>;
  clearQueries: () => void;
}

export const useUserQueries = create<UserQueryStore>(set => ({
  queries: [],
  isLoading: false,
  error: null,
  fetchUserQueries: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`/api/query/user?uid=${userId}`);
      set({ queries: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message ?? "Failed to fetch", isLoading: false });
    }
  },
  clearQueries: () => set({ queries: [] }),
}));
