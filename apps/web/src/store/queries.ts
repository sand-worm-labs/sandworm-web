import { create } from "zustand";

import { fetchUserQuery } from "@/services/axios/queryService";
import type { Query } from "@/types";

interface QueryStore {
  queries: Query[];
  loading: boolean;
  loadQueries: (uid: string) => Promise<void>;
  clearQueries: () => void;
}

export const useQueryStore = create<QueryStore>((set) => ({
  queries: [],
  loading: false,

  loadQueries: async (uid) => {
    set({ loading: true });
    try {
      const res = await fetchUserQuery(uid);
      set({ queries: res?.queries?.page_items || [] });
    } catch (err) {
      console.error("Failed to fetch queries:", err);
      set({ queries: [] });
    } finally {
      set({ loading: false });
    }
  },

  clearQueries: () => set({ queries: [] }),
}));
