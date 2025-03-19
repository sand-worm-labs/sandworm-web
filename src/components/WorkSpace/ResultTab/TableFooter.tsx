import React from "react";

interface ITableFooterProps {
  table: any;
}

export const TableFooter: React.FC<ITableFooterProps> = ({ table }) => {
  return (
    <div className="p-2 border-t border-borderLight">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {table.getFilteredRowModel().rows.length.toLocaleString()} of{" "}
          {table.getPreFilteredRowModel().rows.length.toLocaleString()} rows
        </span>
      </div>
    </div>
  );
};
