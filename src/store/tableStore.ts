import { create } from "zustand";
import type {
  SortingState,
  VisibilityState,
  ColumnFiltersState,
} from "@tanstack/react-table";

interface TableState {
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: (visibility: VisibilityState) => void;
  columnSizing: Record<string, number>;
  setColumnSizing: (sizing: Record<string, number>) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (filters: ColumnFiltersState) => void;
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: (pagination: { pageIndex: number; pageSize: number }) => void;
}

export const useTableStore = create<TableState>(set => ({
  sorting: [],
  setSorting: sorting => set({ sorting }),
  columnVisibility: {},
  setColumnVisibility: visibility => set({ columnVisibility: visibility }),
  columnSizing: {},
  setColumnSizing: sizing => set({ columnSizing: sizing }),
  columnFilters: [],
  setColumnFilters: filters => set({ columnFilters: filters }),
  globalFilter: "",
  setGlobalFilter: filter => set({ globalFilter: filter }),
  pagination: { pageIndex: 0, pageSize: 10 },
  setPagination: pagination => set({ pagination }),
}));

// Utility function for column resizing
export const handleColumnResize = (
  size: number,
  columnId: string,
  setColumnSizing: (
    updater: (prev: Record<string, number>) => Record<string, number>
  ) => void
) => {
  setColumnSizing(prev => ({
    ...prev,
    [columnId]: Math.max(50, size),
  }));
};

// Utility function for auto-sizing columns
export const calculateAutoSize = (
  columnId: string,
  rows: any[],
  sizeCache: Record<string, number>
) => {
  if (sizeCache[columnId]) return sizeCache[columnId];

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return 150;

  context.font = getComputedStyle(document.body).font || "12px sans-serif";
  const headerWidth = context.measureText(columnId).width + 24;
  let maxWidth = headerWidth;

  rows.slice(0, 200).forEach(row => {
    const value = row.getValue(columnId);
    const width = context.measureText(String(value ?? "")).width + 24;
    maxWidth = Math.max(maxWidth, width);
  });

  sizeCache[columnId] = Math.max(maxWidth, 50);
  return sizeCache[columnId];
};

// Utility function for filtering
export const handleFilterChange = (
  value: string,
  setGlobalFilter: (value: string) => void
) => {
  setGlobalFilter(value);
};
