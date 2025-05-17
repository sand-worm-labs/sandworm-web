import type { Table } from "@tanstack/react-table";
import { Columns, RefreshCw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { DownloadDialog } from "../DownloadDialog";
import { SimpleFilter } from "../SimpleFilter";

import { TablePagination } from "./TablePagination";

interface ITableControlsProps<T> {
  table: Table<T>;
  data: any[];
  query: string | undefined;
  isLoading?: boolean;
  onRefresh?: () => void;
  onFilterChange: (value: string) => void;
}

export const TableControls = <T,>({
  table,
  data,
  query,
  isLoading = false,
  onRefresh,
  onFilterChange,
}: ITableControlsProps<T>) => {
  const handleFilterChange = (value: string) => {
    onFilterChange(value);
  };

  return (
    <div className="flex items-center justify-between p-2 border-b dark:border-borderLight">
      <div className="flex items-center space-x-2 flex-1">
        {/* Simple Filter */}
        <div className="flex-1">
          <SimpleFilter
            onFilterChange={handleFilterChange}
            className="w-full"
          />
        </div>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Columns className="h-4 w-4 mr-2" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className=" dark">
            <div className="max-h-64 overflow-auto">
              {table
                .getAllColumns()
                .filter(col => col.id !== "__index")
                .map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                    className="text-sm"
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DownloadDialog data={data || []} query={query} />

        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <TablePagination table={table} />
    </div>
  );
};
