import type { Table } from "@tanstack/react-table";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { TablePageSizeSelector } from "./TablePageSizeSelector";

interface ITablePaginationProps<T> {
  table: Table<T>;
}

export const TablePagination = <T,>({ table }: ITablePaginationProps<T>) => {
  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>First Page</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Previous Page Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous Page</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Page Number Display */}
      <span className="text-gray-600 dark:text-gray-300 min-w-[100px] text-center text-xs">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </span>

      {/* Next Page Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
            >
              <ChevronRight size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next Page</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Last Page Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
            >
              <ChevronsRight size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Last Page</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Page Size Selector */}
      <TablePageSizeSelector table={table} />
    </div>
  );
};
