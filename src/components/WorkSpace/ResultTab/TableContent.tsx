import React, { useRef, useEffect, useCallback } from "react";
import { type Table, type ColumnDef, flexRender } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";

import { TableRow } from "./TableRow";

const OVERSCAN_COUNT = 5;
const ROW_HEIGHT = 35;

export interface ITableContentProps<T> {
  table: Table<any>;
  memoizedColumns: ColumnDef<T>[];
  renderCell: (cellContext: any) => React.ReactNode;
  onLoadMore?: () => void;
  isLoading?: boolean;
  virtualScrolling?: boolean;
  calculateAutoSize: (columnId: string) => number;
  handleColumnResize: (newSize: number, columnId: string) => void;
  globalFilter: string;
}

export const TableContent = <T,>({
  table,
  memoizedColumns,
  renderCell,
  onLoadMore,
  isLoading = false,
  virtualScrolling = true,
  calculateAutoSize,
  handleColumnResize,
  globalFilter,
}: ITableContentProps<T>) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLTableRowElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Virtual scrolling setup
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: useCallback(() => ROW_HEIGHT, []),
    overscan: OVERSCAN_COUNT,
  });

  const virtualRows = virtualScrolling
    ? rowVirtualizer.getVirtualItems()
    : rows.map((_, index) => ({
        index,
        start: index * ROW_HEIGHT,
        size: ROW_HEIGHT,
      }));

  useEffect(() => {
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

    observerRef.current = observer;
    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [
    onLoadMore,
    isLoading,
    globalFilter,
    table.getState().pagination.pageSize,
  ]);

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows[virtualRows.length - 1].start || 0) -
        virtualRows[virtualRows.length - 1].size
      : 0;

  return (
    <div
      ref={tableContainerRef}
      className="relative flex-1 overflow-auto w-full"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <table className="w-full table-fixed">
          <colgroup>
            {table.getAllColumns().map(column => (
              <col key={column.id} style={{ width: column.getSize() }} />
            ))}
          </colgroup>

          <thead className="sticky top-0 z-1 ">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={`
                      relative p-2 text-left font-medium text-white border-borderLight
                      border-b text-xs select-none bg-muted
                      ${header.column.getCanSort() ? "cursor-pointer" : ""}
                    `}
                    onClick={
                      header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                      {header.column.getIsSorted() && (
                        <span className="text-primary">
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </div>

                    {header.column.getCanResize() && (
                      <button
                        type="button"
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => {
                          const newSize = calculateAutoSize(header.column.id);
                          handleColumnResize(newSize, header.column.id);
                        }}
                        className={`
                          absolute right-[-1px] top-0 h-full w-[2px]
                          cursor-col-resize select-none touch-none
                          bg-borderLight
                          hover:bg-primary/50
                          ${header.column.getIsResizing() ? "bg-primary w-1" : ""}
                          transition-colors
                        `}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td
                  style={{ height: `${paddingTop}px` }}
                  colSpan={memoizedColumns.length}
                />
              </tr>
            )}

            {virtualRows.map(virtualRow => {
              const row = rows[virtualRow.index];
              return (
                <TableRow key={row.id} row={row} renderCell={renderCell} />
              );
            })}

            {paddingBottom > 0 && (
              <tr>
                <td
                  style={{ height: `${paddingBottom}px` }}
                  colSpan={memoizedColumns.length}
                />
              </tr>
            )}

            {onLoadMore && (
              <tr ref={loadMoreRef}>
                <td
                  colSpan={memoizedColumns.length}
                  className="text-center p-4"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Scroll to load more
                    </span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
