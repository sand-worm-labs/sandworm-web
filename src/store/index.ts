import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toast } from "sonner";

export interface CurrentConnection {
  environment: "APP" | "ENV" | "BUILT_IN";
  id: string;
  name: string;
  scope: "WASM" | "External";
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  authMode?: "none" | "password" | "api_key";
}

export interface ConnectionProvider {
  environment: "APP" | "ENV" | "BUILT_IN";
  id: string;
  name: string;
  scope: "WASM" | "External";
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  authMode?: "none" | "password" | "api_key";
}

export interface ConnectionList {
  connections: ConnectionProvider[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
}

export interface TableInfo {
  name: string;
  schema: string;
  columns: ColumnInfo[];
  rowCount: number;
  createdAt: string;
}

export interface DatabaseInfo {
  name: string;
  tables: TableInfo[];
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

export interface EditorTab {
  id: string;
  title: string;
  type: EditorTabType;
  content: string | { database?: string; table?: string };
  result?: QueryResult | null;
}

export interface SandwormStoreState {
  // Database state

  isInitialized: boolean;
  currentDatabase: string;
  currentConnection: CurrentConnection | null;
  connectionList: ConnectionList;

  // Data Explorer State
  databases: DatabaseInfo[];

  // Query management
  queryHistory: QueryHistoryItem[];
  isExecuting: boolean;

  // Tab Management
  tabs: EditorTab[];
  activeTabId: string | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Data Explorer State (renamed to fix typo)
  isLoadingDbTablesFetch: boolean;

  isLoadingExternalConnection: boolean;

  // Actions
  initialize: () => Promise<void>;
  executeQuery: (query: string, tabId?: string) => Promise<QueryResult | void>;
  createTab: (
    title?: string,
    type?: EditorTabType,
    content?: EditorTab["content"]
  ) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabQuery: (tabId: string, query: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  moveTab: (oldIndex: number, newIndex: number) => void;
  closeAllTabs: () => void;
  deleteTable: (tableName: string, database?: string) => Promise<void>;
  clearHistory: () => void;
  cleanup: () => Promise<void>;
  exportParquet: (query: string) => Promise<Blob>;
}

// Create a mock WASM query result
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

  // Define schema that matches your data
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
const mockResult = createMockWasmResult();

// Converts a WASM query result into a QueryResult.
const resultToJSON = (result: any): QueryResult => {
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
 * Executes a query against an external connection.
 * @param query The query string.
 * @param connection The external connection details.
 */

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

//
// STORE DEFINITION
//

export const useSandwormStore = create<SandwormStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        db: null,
        connection: null,
        isInitialized: false,
        currentDatabase: "memory",
        databases: [],
        queryHistory: [],
        isExecuting: false,
        tabs: [
          {
            id: "home",
            title: "Home",
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

        initialize: async () => {},

        // Execute a query with proper error handling.
        executeQuery: async (query, tabId?) => {
          try {
            set({ isExecuting: true, error: null });
            const queryResult = resultToJSON(mockResult);

            console.log(query + tabId);

            // Update query history and update tab result if applicable.
            set(state => ({
              queryHistory: updateHistory(state.queryHistory, query),
              tabs: state.tabs.map(tab =>
                tab.id === tabId ? { ...tab, result: queryResult } : tab
              ),
              isExecuting: false,
            }));

            return tabId ? undefined : queryResult;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
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
          }
        },

        // Tab management actions.
        createTab: (title, type = "sql", content = "") => {
          const newTab: EditorTab = {
            id: crypto.randomUUID(),
            title: typeof title === "string" ? title : "New Query",
            type,
            content,
          };
          set(state => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
          }));
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
          console.log("hmmm1");
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

        closeAllTabs: () => {
          // Close all tabs except the home tab.
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

        deleteTable: async (tableName, database = "memory") => {
          try {
            const { connection, currentConnection } = get();
            if (currentConnection?.scope === "External") {
              throw new Error(
                "Table deletion is not supported for external connections."
              );
            }
            const wasmConnection = validateConnection(connection);
            set({ isLoading: true });
            await wasmConnection.query(
              `DROP TABLE IF EXISTS "${database}"."${tableName}"`
            );
            await get().fetchDatabasesAndTablesInfo();
            set({ isLoading: false });
          } catch (error) {
            set({
              isLoading: false,
              error: `Failed to delete table: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            });
            throw error;
          }
        },

        clearHistory: () => {
          set({ queryHistory: [] });
        },

        exportParquet: async (query: string) => {
          try {
            const { connection, db, currentConnection } = get();
            if (currentConnection?.scope === "External") {
              throw new Error(
                "Exporting to parquet is not supported for external connections."
              );
            }
            if (!connection || !db) {
              throw new Error("Database not initialized");
            }
            const now = new Date()
              .toISOString()
              .split(".")[0]
              .replace(/[:]/g, "-");
            const fileName = `result-${now}.parquet`;
            await connection.query(
              `COPY (${query}) TO '${fileName}' (FORMAT 'parquet')`
            );
            const parquetBuffer = await db.copyFileToBuffer(fileName);
            await db.dropFile(fileName);
            return new Blob([parquetBuffer], { type: "application/parquet" });
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
            databases: [],
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
      }),
      {
        name: "sandworm-storage",
        // Persist only selected parts of the state.
        partialize: state => ({
          queryHistory: state.queryHistory,
          databases: state.databases,
          tabs: state.tabs.map(tab => ({ ...tab, result: undefined })),
          currentDatabase: state.currentDatabase,
          currentConnection: state.currentConnection,
          connectionList: state.connectionList,
        }),
      }
    )
  )
);
