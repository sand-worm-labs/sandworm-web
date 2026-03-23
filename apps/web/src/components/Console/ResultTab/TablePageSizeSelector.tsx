import type { Table } from "@tanstack/react-table";
import { Label } from "@sandworm/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sandworm/ui/components/select";

const PAGE_SIZE_OPTIONS = [50, 100, 200, 400];

interface ITablePageSizeSelectorProps<T> {
  table: Table<T>;
}

export const TablePageSizeSelector = <T,>({
  table,
}: ITablePageSizeSelectorProps<T>) => {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="page-size" className="text-xs text-ink-400 ">
        Rows:
      </Label>
      <Select onValueChange={value => table.setPageSize(Number(value))}>
        <SelectTrigger className="w-[70px] h-8 text-xs">
          <SelectValue
            placeholder={String(table.getState().pagination.pageSize)}
          />
        </SelectTrigger>
        <SelectContent className="dark">
          {PAGE_SIZE_OPTIONS.map(size => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
