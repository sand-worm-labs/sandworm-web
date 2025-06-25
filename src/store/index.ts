// sandworm main store. handle most state management for workspace
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";

import { runQuery } from "@/helpers/queryclient";
import { generateUUID } from "@/lib/utils";

export interface CurrentConnection {
  executionMethod: "JSON_RPC" | "GRAPHQL" | "HTTP ";
}

export interface ConnectionProvider {
  executionMethod: "rpc" | "indexed";
}

export interface ConnectionList {
  connections: ConnectionProvider[];
}

export interface QueryResult {
  columns: string[];
  columnTypes: string[];
  data: Record<string, unknown>[];
  rowCount: number;
  error?: string;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  error?: string;
}

export type EditorTabType = "sql" | "home";

export type ExecutionMethodType = "rpc" | "indexed";

export type Theme = "sandworm" | "vs-dark" | "vs-light" | "monokai";

export interface EditorTab {
  id: string;
  title: string;
  type: EditorTabType;
  content: string | { database?: string; table?: string };
  executionType?: ExecutionMethodType;
  createdAt?: number;
  result?: QueryResult | null;
  readonly?: boolean;
  saved?: boolean;
}

const chainRpcMap: Record<string, string> = {
  Sui: "https://rpc.sui.io",
  Ethereum: "https://mainnet.infura.io/v3/YOUR_KEY",
  Base: "https://base-mainnet.infura.io/v3/YOUR_PROJECT_ID",
  Polygon: "https://polygon-rpc.com",
  Arbitrum: "https://arb1.arbitrum.io/rpc",
};

export interface SandwormSettings {
  selectedChain: string;
  rpcUrl: string;
  editorTheme: "sandworm" | "vs-dark" | "vs-light" | "monokai";
  shortcutsEnabled: boolean;
  betaFeatures: boolean;
  defaultChain: string;
}

let currentController: AbortController | null = null;

export interface SandwormStoreState {
  isInitialized: boolean;
  currentDatabase: string;
  currentConnection: CurrentConnection | null;
  connectionList: ConnectionList;
  queryHistory: QueryHistoryItem[];
  isExecuting: boolean;
  tabs: EditorTab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;
  settings: SandwormSettings;
  initialize: () => Promise<void>;
  executeQuery: (
    query: string,
    tabId?: string,
    provider?: ConnectionProvider
  ) => Promise<QueryResult | void>;
  cancelQueryExecution: () => void;
  setExecutionType: (tabId: string, executionType: ExecutionMethodType) => void;
  createTab: (
    title?: string,
    id?: string,
    type?: EditorTabType,
    content?: EditorTab["content"],
    executionType?: ExecutionMethodType
  ) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabQuery: (tabId: string, query: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  replaceTabId: (oldtabId: string, newtabId: string) => void;
  moveTab: (oldIndex: number, newIndex: number) => void;
  closeAllTabs: () => void;
  clearHistory: () => void;
  cleanup: () => Promise<void>;
  exportParquet: (query: string) => Promise<Blob>;

  // 🔧 Settings Action
  setSelectedChain: (chain: string) => void;
  setRpcUrl: (url: string) => void;
  setEditorTheme: (theme: Theme) => void;
  setShortcutsEnabled: (enabled: boolean) => void;
  setBetaFeatures: (enabled: boolean) => void;
  setDefaultChain: (chain: string) => void;
}

const createMockWasmResult = () => {
  const mockEntry = {
    block_date: "2024-08-26T00:00:00Z",
    checkpoint_commitments: [],
    digest: "5zNK7NRujRr8r8HZUXKRrohth7uLDRFcW3abBiSsb5i7",
    timestamp: "2024-08-26T22:26:46Z",
    total_computation_cost: 0,
    total_gas_cost: 1338125222440,
    total_storage_cost: 6531590791600,
    total_storage_rebate: 6380271342720,
  };

  const mockData = Array.from({ length: 80 }, () => ({ ...mockEntry }));

  const schema = {
    fields: [
      { name: "block_date", type: { toString: () => "Date64<MILLISECOND>" } },
      { name: "checkpoint_commitments", type: { toString: () => "List" } },
      { name: "digest", type: { toString: () => "String" } },
      { name: "timestamp", type: { toString: () => "Timestamp<MICROSECOND>" } },
      { name: "total_computation_cost", type: { toString: () => "Int64" } },
      { name: "total_gas_cost", type: { toString: () => "Int64" } },
      { name: "total_storage_cost", type: { toString: () => "Int64" } },
      { name: "total_storage_rebate", type: { toString: () => "Int64" } },
    ],
  };

  const rows = mockData.map(row => ({
    toJSON: () => ({ ...row }),
  }));

  return {
    schema,
    toArray: () => rows,
    numRows: rows.length,
  };
};

// Create the mock and test it
export const mockResult = createMockWasmResult();

// Converts a WASM query result into a QueryResult.
export const resultToJSON = (result: any): QueryResult => {
  const data = result.toArray().map((row: any) => {
    const jsonRow = row.toJSON();
    result.schema.fields.forEach((field: any) => {
      const col = field.name;
      const type = field.type.toString();
      try {
        let value = jsonRow[col];
        if (value === null || value === undefined) return;
        if (type === "Date32<DAY>") {
          value = new Date(value).toLocaleDateString();
          jsonRow[col] = value;
        }
        if (
          type === "Date64<MILLISECOND>" ||
          type === "Timestamp<MICROSECOND>"
        ) {
          value = new Date(value);
          jsonRow[col] = value;
        }
      } catch (error) {
        console.error(`Error processing column ${col}:`, error);
      }
    });
    return jsonRow;
  });
  return {
    columns: result.schema.fields.map((field: any) => field.name),
    columnTypes: result.schema.fields.map((field: any) =>
      field.type.toString()
    ),
    data,
    rowCount: result.numRows,
  };
};

/**
 * Helper to update query history.
 */
const updateHistory = (
  currentHistory: QueryHistoryItem[],
  query: string,
  errorMsg?: string
): QueryHistoryItem[] => {
  const newItem: QueryHistoryItem = {
    id: crypto.randomUUID(),
    query,
    timestamp: new Date(),
    ...(errorMsg ? { error: errorMsg } : {}),
  };
  const existingIndex = currentHistory.findIndex(item => item.query === query);
  const newHistory =
    existingIndex !== -1
      ? [newItem, ...currentHistory.filter((_, idx) => idx !== existingIndex)]
      : [newItem, ...currentHistory];
  return newHistory.slice(0, 15);
};

// Main store
export const useSandwormStore = create<SandwormStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        db: null,
        connection: null,
        isInitialized: false,
        currentDatabase: "memory",
        databases: [],
        queryHistory: [],
        isExecuting: false,
        tabs: [
          {
            title: "Home",
            id: "home",
            type: "home",
            content: "",
          },
        ],
        activeTabId: "home",
        isLoading: false,
        isLoadingDbTablesFetch: true,
        isLoadingExternalConnection: false,
        error: null,
        currentConnection: null,
        connectionList: {
          connections: [],
        },
        settings: {
          selectedChain: "Sui",
          rpcUrl: chainRpcMap.Sui,
          editorTheme: "sandworm",
          shortcutsEnabled: true,
          betaFeatures: false,
          defaultChain: "Sui",
        },

        initialize: async () => {},
        executeQuery: async (query, tabId?, provider?) => {
          if (currentController) currentController.abort();

          const controller = new AbortController();
          const { signal } = controller;
          currentController = controller;

          const executionType = provider?.executionMethod ?? "rpc";
          const API_URL = "https://node.sandwormlabs.xyz/run?";
          set({ isExecuting: true, error: null });

          try {
            const queryResult = await runQuery(
              API_URL,
              query,
              executionType,
              signal
            );

            if (queryResult.error === "QueryAborted") {
              console.warn("Skipped logging aborted query");
              set({ isExecuting: false });
              return queryResult;
            }

            set(state => ({
              queryHistory: updateHistory(
                state.queryHistory,
                query,
                queryResult.error || undefined
              ),
              tabs: state.tabs.map(tab =>
                tab.id === tabId ? { ...tab, result: queryResult } : tab
              ),
              isExecuting: false,
            }));

            return queryResult;
          } catch (error) {
            console.error("Unexpected wrapper error:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";

            // if the query was aborted, skip the state update
            if (errorMessage === "QueryAborted") {
              console.warn("Query was aborted. Skipping state update.");
              set({ isExecuting: false });
              return {
                columns: [],
                columnTypes: [],
                data: [],
                rowCount: 0,
                error: "QueryAborted",
              };
            }

            const errorResult: QueryResult = {
              columns: [],
              columnTypes: [],
              data: [],
              rowCount: 0,
              error: errorMessage,
            };

            set(state => ({
              queryHistory: updateHistory(
                state.queryHistory,
                query,
                errorMessage
              ),
              tabs: state.tabs.map(tab =>
                tab.id === tabId ? { ...tab, result: errorResult } : tab
              ),
              isExecuting: false,
              error: errorMessage,
            }));

            return errorResult;
          }
        },

        cancelQueryExecution: () => {
          if (currentController) {
            currentController.abort();
            currentController = null;
          }
        },

        setExecutionType: (
          tabId: string,
          executionType: ExecutionMethodType
        ) => {
          set(state => ({
            tabs: state.tabs.map(tab =>
              tab.id === tabId ? { ...tab, executionType } : tab
            ),
          }));
        },

        createTab: (
          title?: string,
          id?: string,
          type: EditorTab["type"] = "sql",
          content = "",
          executionType: ExecutionMethodType = "rpc"
        ): string => {
          const tabId = id ?? crypto?.randomUUID?.() ?? generateUUID();

          set(state => {
            const existingTab = state.tabs.find(tab => tab.id === tabId);

            if (existingTab) {
              return { ...state, activeTabId: tabId };
            }

            const newTab: EditorTab = {
              id: tabId,
              title: title?.trim() || "Untitled Query",
              type,
              content,
              executionType,
              createdAt: Date.now(),
              readonly: Boolean(id),
            };

            return {
              tabs: [...state.tabs, newTab],
              activeTabId: tabId,
            };
          });

          return tabId;
        },

        closeTab: tabId => {
          set(state => {
            const updatedTabs = state.tabs.filter(tab => tab.id !== tabId);
            let newActiveTabId = state.activeTabId;
            if (updatedTabs.length === 0) {
              const newTab: EditorTab = {
                id: crypto.randomUUID(),
                title: "Query 1",
                type: "sql",
                content: "",
              };
              return {
                tabs: [newTab],
                activeTabId: newTab.id,
              };
            }
            if (state.activeTabId === tabId) {
              newActiveTabId = updatedTabs[0]?.id || null;
            }
            return {
              tabs: updatedTabs,
              activeTabId: newActiveTabId,
            };
          });
        },

        setActiveTab: tabId => {
          set({ activeTabId: tabId });
        },

        updateTabQuery: (tabId, query) => {
          set(state => ({
            tabs: state.tabs.map(tab =>
              tab.id === tabId && tab.type === "sql"
                ? { ...tab, content: query }
                : tab
            ),
          }));
        },

        updateTabTitle: (tabId, title) => {
          set(state => ({
            tabs: state.tabs.map(tab =>
              tab.id === tabId ? { ...tab, title } : tab
            ),
          }));
        },

        moveTab: (oldIndex, newIndex) => {
          set(state => {
            const newTabs = [...state.tabs];
            const [movedTab] = newTabs.splice(oldIndex, 1);
            newTabs.splice(newIndex, 0, movedTab);
            return { tabs: newTabs };
          });
        },

        replaceTabId: (oldId: string, newId: string) => {
          set(state => {
            const tab = state.tabs.find(t => t.id === oldId);
            if (!tab) return state;

            const updatedTab = { ...tab, id: newId };

            const updatedTabs = state.tabs
              .filter(t => t.id !== oldId)
              .concat(updatedTab);

            return {
              tabs: updatedTabs,
              activeTabId: newId,
            };
          });
        },

        closeAllTabs: () => {
          try {
            set(state => ({
              tabs: state.tabs.filter(tab => tab.type === "home"),
              activeTabId: "home",
            }));
            toast.success("All tabs closed successfully!");
          } catch (error: any) {
            toast.error(`Failed to close tabs: ${error.message}`);
          }
        },

        clearHistory: () => {
          set({ queryHistory: [] });
        },

        exportParquet: async (query: string) => {
          try {
            const now = new Date()
              .toISOString()
              .split(".")[0]
              .replace(/[:]/g, "-");
            const fileName = `result-${now}.parquet`;
            console.log(fileName, query);

            console.error("Parquet export functionality not implemented");
            throw new Error("Parquet export functionality not implemented");
          } catch (error) {
            console.error("Failed to export to parquet:", error);
            throw new Error(
              `Parquet export failed: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        },

        cleanup: async () => {
          set({
            isInitialized: false,
            currentDatabase: "memory",
            error: null,
            queryHistory: [],
            tabs: [
              {
                id: "home",
                title: "Home",
                type: "home",
                content: "",
              },
            ],
            activeTabId: "home",
            currentConnection: null,
          });
        },

        // ⚡ settings actions
        setSelectedChain: chain => {
          const currentRpc = get().settings.rpcUrl;
          const previousChain = get().settings.selectedChain;
          const previousRpc = chainRpcMap[previousChain];
          const defaultRpc = chainRpcMap[chain];

          set(state => ({
            settings: {
              ...state.settings,
              selectedChain: chain,
              rpcUrl: currentRpc === previousRpc ? defaultRpc : currentRpc,
            },
          }));
        },

        setRpcUrl: url =>
          set(state => ({
            settings: { ...state.settings, rpcUrl: url },
          })),

        setEditorTheme: theme =>
          set(state => ({
            settings: { ...state.settings, editorTheme: theme },
          })),

        setShortcutsEnabled: enabled =>
          set(state => ({
            settings: { ...state.settings, shortcutsEnabled: enabled },
          })),

        setBetaFeatures: enabled =>
          set(state => ({
            settings: { ...state.settings, betaFeatures: enabled },
          })),

        setDefaultChain: chain =>
          set(state => ({
            settings: { ...state.settings, defaultChain: chain },
          })),
      }),
      {
        name: "sandworm-storage",
        partialize: state => ({
          queryHistory: state.queryHistory,
          tabs: state.tabs.map(tab => ({ ...tab, result: undefined })),
          activeTabId: state.activeTabId,
          currentDatabase: state.currentDatabase,
          currentConnection: state.currentConnection,
          connectionList: state.connectionList,
          settings: state.settings,
        }),
      }
    )
  )
);
