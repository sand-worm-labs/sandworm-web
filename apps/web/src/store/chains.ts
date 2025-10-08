import { create } from "zustand";
import axios from "axios";

interface ChainStoreState {
  chains: any[] | null;
  entityData: {
    raw: any;
    decoded: any;
    project: any;
  } | null;
  loading: boolean;
  error: string | null;
  fetchChainData: () => Promise<void>;
  fetchEntityData: (chainName: string) => Promise<void>;
}

export const useChainStore = create<ChainStoreState>(set => ({
  chains: null,
  entityData: null,
  loading: false,
  error: null,

  fetchChainData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/sand-worm-sql/chain_registry/main/data/chain/index.json"
      );
      set({ chains: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch chains", loading: false });
    }
  },

  fetchEntityData: async (chainName: string) => {
    set({ loading: true, error: null });

    const baseUrl = `https://raw.githubusercontent.com/sand-worm-sql/chain_registry/main/data/entities/${chainName}`;

    const files = ["raw.json", "decoded.json", "projects.json"];

    try {
      const results = await Promise.allSettled(
        files.map(file => axios.get(`${baseUrl}/${file}`))
      );

      const [rawRes, decodedRes, projectRes] = results;

      const entityData = {
        raw: rawRes.status === "fulfilled" ? rawRes.value.data : [],
        decoded: decodedRes.status === "fulfilled" ? decodedRes.value.data : [],
        project: projectRes.status === "fulfilled" ? projectRes.value.data : [],
      };

      set({ entityData, loading: false });
    } catch (error) {
      set({
        error: `Something unexpected happened while fetching entity data for ${chainName}`,
        loading: false,
      });
    }
  },
}));
