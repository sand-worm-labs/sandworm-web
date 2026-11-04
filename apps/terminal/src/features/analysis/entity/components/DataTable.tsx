import type { ReactNode } from "react";
import clsx from "clsx";
import { InitialsAvatar } from "@sandworm/ui/kit/initials-avatar";
import { Pill } from "@sandworm/ui/kit/pill";
import { TONE_BADGE_CLASSNAME } from "@sandworm/ui/kit/tone";

import { exhaustiveCheck } from "@/lib/exhaustive";

import type { EntityBlock, TableCell, TableColumn } from "../types";

import { SectionCard } from "./SectionCard";

type DataTableBlock = Extract<EntityBlock, { _tag: "dataTable" }>;

function rowHeaderIndex(cells: readonly TableCell[]): number {
  const index = cells.findIndex(
    cell => cell._tag === "entity" || (cell._tag === "text" && cell.isStrong)
  );
  return Math.max(index, 0);
}

function renderCell(cell: TableCell): ReactNode {
  switch (cell._tag) {
    case "text":
      return cell.text;
    case "entity":
      return (
        <span className="inline-flex items-center gap-2.5">
          <InitialsAvatar initials={cell.name.charAt(0)} size="sm" />
          {cell.name}
        </span>
      );
    case "badge":
      return cell.tone === "brand" ? (
        <Pill>{cell.text}</Pill>
      ) : (
        <span
          className={clsx(
            "inline-flex h-[22px] items-center rounded-md px-2 text-xs font-medium",
            TONE_BADGE_CLASSNAME[cell.tone]
          )}
        >
          {cell.text}
        </span>
      );
    default:
      return exhaustiveCheck(cell);
  }
}

function cellClassName(column: TableColumn | undefined, edge: boolean) {
  return clsx(
    "py-3.5 align-middle",
    edge ? "px-6" : "px-3",
    column?.align === "right" ? "text-right" : "text-left"
  );
}

export function DataTable({ block }: { block: DataTableBlock }) {
  const last = block.columns.length - 1;

  return (
    <SectionCard id={block.id} title={block.title} subtitle={block.subtitle}>
      <div className="-mx-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr className="text-xs text-ink-400">
              {block.columns.map((column, index) => (
                <th
                  key={column.id}
                  scope="col"
                  className={clsx(
                    "py-2.5 font-medium",
                    index === 0 || index === last ? "px-6" : "px-3",
                    column.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map(row => {
              const headerAt = rowHeaderIndex(row.cells);
              return (
                <tr key={row.id} className="border-t border-border-secondary">
                  {row.cells.map((cell, index) => {
                    const column = block.columns[index];
                    const className = clsx(
                      cellClassName(column, index === 0 || index === last),
                      index === headerAt
                        ? "font-medium text-ink-100"
                        : "text-ink-500"
                    );
                    return index === headerAt ? (
                      <th key={column?.id} scope="row" className={className}>
                        {renderCell(cell)}
                      </th>
                    ) : (
                      <td key={column?.id} className={className}>
                        {renderCell(cell)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
