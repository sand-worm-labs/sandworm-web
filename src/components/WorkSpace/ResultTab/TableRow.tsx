import { flexRender } from "@tanstack/react-table";
import type { Row } from "@tanstack/react-table";

interface ITableRowProps<T> {
  row: Row<T>;
  renderCell: (cell: any) => React.ReactNode;
}

export const TableRow = <T,>({
  row,
  renderCell = cell =>
    flexRender(cell.column.columnDef.cell, cell.getContext()),
}: ITableRowProps<T>) => {
  return (
    <tr
      key={row.id}
      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-xs"
    >
      {row.getVisibleCells().map(cell => (
        <td
          key={cell.id}
          style={{ width: cell.column.getSize() }}
          className="p-2 border border-borderLight truncate"
        >
          {renderCell(cell)}
        </td>
      ))}
    </tr>
  );
};
