import { create } from "zustand";
import axios from "axios";

interface ChainStoreState {
  data: any | null;
  entityData: any | null;
  loading: boolean;
  error: string | null;
  fetchChainData: () => Promise<void>;
  fetchEntityData: (chainName: string) => Promise<void>;
}

export const useChainStore = create<ChainStoreState>(set => ({
  data: null,
  entityData: null,
  loading: false,
  error: null,

  fetchChainData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/sand-worm-sql/chain_registry/main/data/chain/index.json"
      );
      set({ data: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch chains", loading: false });
    }
  },

  fetchEntityData: async (chainName: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        `https://raw.githubusercontent.com/sand-worm-sql/chain_registry/main/data/entities/${chainName}/rpc.json`
      );
      set({ entityData: response.data, loading: false });
    } catch (error) {
      set({
        error: `Failed to fetch entity data for ${chainName}`,
        loading: false,
      });
    }
  },
}));
