import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type {
  ColumnDef,
  SortingState,
  RowData,
  VisibilityState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { TableFooter } from "./TableFooter";
import { TableControls } from "./TableControl";
import { TableContent } from "./TableContent";
import { IndexCell } from "./IndexCell";
import { QueryResultJson } from "./QueryResultJson";

// Constants
const DEFAULT_COLUMN_SIZE = 150;
const MIN_COLUMN_SIZE = 50;
const DEFAULT_PAGE_SIZE = 50;

// Types
export interface TableMeta {
  name: string;
  type: string;
}

export interface TableResult<T extends RowData> {
  columns?: string[];
  columnTypes?: string[];
  data?: T[];
  message?: string;
  queryId?: string;
}

export interface TableProps<T extends RowData> {
  result: TableResult<T>;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  virtualScrolling?: boolean;
  defaultSorting?: SortingState;
  defaultColumnVisibility?: VisibilityState;
  onSortingChange?: (sorting: SortingState) => void;
  className?: string;
  query?: string;
}

const renderIndexCell = (index: number) => {
  return <IndexCell index={index} />;
};

function QueryResultsTable<T extends RowData>({
  result,
  onLoadMore,
  onRefresh,
  isLoading = false,
  virtualScrolling = true,
  defaultSorting = [],
  defaultColumnVisibility = {},
  onSortingChange,
  className,
  query,
}: TableProps<T>) {
  // State
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultColumnVisibility
  );
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [, setFilterValue] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // Refs
  const sizeCache = useRef<Record<string, number>>({});
  const loadMoreRef = useRef<HTMLTableRowElement>(null);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { columns, data, message, queryId } = result;

  // Handle column resize
  const handleColumnResize = useCallback((size: number, columnId: string) => {
    if (resizeTimeout.current) {
      clearTimeout(resizeTimeout.current);
    }

    resizeTimeout.current = setTimeout(() => {
      setColumnSizing(prev => ({
        ...prev,
        [columnId]: Math.max(MIN_COLUMN_SIZE, size),
      }));
    }, 10);
  }, []);

  // Update your memoizedColumns definition
  const memoizedColumns = useMemo<ColumnDef<T>[]>(() => {
    const baseColumns = columns?.map(col => ({
      id: col,
      accessorKey: col,
      header: col,
      enableResizing: true,
      size: columnSizing[col] || DEFAULT_COLUMN_SIZE,
      minSize: MIN_COLUMN_SIZE,
      cell: ({ row }: any) => {
        return String(row.original[col] ?? "");
      },
    }));

    return [
      {
        id: "__index",
        header: "#",
        size: 70,
        minSize: 50,
        maxSize: 70,
        enableResizing: false,
        cell: ({ row }) => renderIndexCell(row.index),
      },
      ...baseColumns,
    ];
  }, [columns, columnSizing]);

  // Table instance
  const table = useReactTable({
    data: data || [],
    columns: memoizedColumns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      pagination,
      columnSizing,
    },
    onSortingChange: updater => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: updater => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      setPagination(newPagination);
    },
    onColumnSizingChange: updater => {
      const newSizing =
        typeof updater === "function" ? updater(columnSizing) : updater;
      setColumnSizing(newSizing);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase().trim();
      if (!searchValue) return true;

      const cellValue = row.getValue(columnId);
      if (cellValue == null) return false;

      return String(cellValue).toLowerCase().includes(searchValue);
    },
  });

  // Virtual scrolling setup
  const { rows } = table.getRowModel();

  // Column auto-sizing
  const calculateAutoSize = useCallback(
    (columnId: string) => {
      if (sizeCache.current[columnId]) return sizeCache.current[columnId];

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) return DEFAULT_COLUMN_SIZE;

      context.font = getComputedStyle(document.body).font || "12px sans-serif";
      const headerWidth = context.measureText(columnId).width + 24;
      let maxWidth = headerWidth;

      const sampleRows = rows.slice(0, 200);
      sampleRows.forEach(row => {
        const value = row.getValue(columnId);
        const width = context.measureText(String(value ?? "")).width + 24;
        maxWidth = Math.max(maxWidth, width);
      });

      const finalSize = Math.max(maxWidth, MIN_COLUMN_SIZE);
      sizeCache.current[columnId] = finalSize;
      return finalSize;
    },
    [rows]
  );

  const handleFilterChange = useCallback(
    (value: string) => {
      setFilterValue(value); // Update the filterValue state (optional, for debugging)
      setGlobalFilter(value); // Update globalFilter state, which triggers filtering
    },
    [setGlobalFilter]
  );

  // Load more effect (Corrected)
  useEffect(() => {
    // Disconnect previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!onLoadMore || !loadMoreRef.current || isLoading) {
      return () => {};
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.8 }
    );

    observerRef.current = observer; // Store the observer in the ref
    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect(); // Disconnect observer on unmount
      observerRef.current = null;
    };
  }, [
    onLoadMore,
    isLoading,
    globalFilter,
    table.getState().pagination.pageSize,
  ]);

  // Effects
  useEffect(() => {
    table.setPageSize(DEFAULT_PAGE_SIZE);
  }, [table]);

  // Render methods
  const renderCell = useCallback((cell: any) => {
    return flexRender(cell.column.columnDef.cell, cell.getContext());
  }, []);

  useEffect(() => {
    if (message) {
      toast.error(`Error: ${message}`);
    }
  }, [message]);

  if (message) {
    return (
      <div className="w-full mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Query ID: {queryId || "Unknown"}
        </p>
      </div>
    );
  }

  if (!data || !columns) {
    return (
      <div className="w-full mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex min-h-[200px] flex-col ${className}`}>
      <QueryResultJson result={result} />

      {/*     <TableControls
        table={table}
        data={data}
        query={query}
        isLoading={isLoading}
        onRefresh={onRefresh}
        onFilterChange={handleFilterChange}
      />
      <TableContent
        table={table}
        memoizedColumns={memoizedColumns}
        renderCell={renderCell}
        onLoadMore={onLoadMore}
        isLoading={isLoading}
        virtualScrolling={virtualScrolling}
        calculateAutoSize={calculateAutoSize}
        handleColumnResize={handleColumnResize}
        globalFilter={globalFilter}
      />
      <TableFooter table={table} /> */}
    </div>
  );
}

export default React.memo(QueryResultsTable) as typeof QueryResultsTable;
