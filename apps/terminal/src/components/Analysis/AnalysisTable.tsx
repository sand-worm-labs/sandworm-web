import clsx from "clsx";
import { InitialsAvatar } from "@sandworm/ui/kit/initials-avatar";
import { Pill } from "@sandworm/ui/kit/pill";

import { AppLink } from "@/components/AppLink";
import type { AnalysisView } from "@/features/analysis/types";

type AnalysisTableProps = {
  view: AnalysisView;
  rows: AnalysisView["rows"];
};

const headerCellClassName = "px-3 py-2.5 text-xs font-medium text-ink-400";

function cellClassName(index: number, extra?: string) {
  return clsx(
    "px-3 py-3 align-middle group-hover:bg-hover-bg dark:group-hover:bg-sidebar-hover",
    index > 0 && "border-t border-border-secondary",
    extra
  );
}

export function AnalysisTable({ view, rows }: AnalysisTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] table-fixed border-separate border-spacing-0 px-2 pb-2.5 pt-1.5 text-left text-[13px]">
        <thead>
          <tr>
            <th scope="col" className={clsx(headerCellClassName, "w-[26%]")}>
              {view.columnName}
            </th>
            <th
              scope="col"
              className={clsx(headerCellClassName, "w-[70px] text-right")}
            >
              Reports
            </th>
            <th scope="col" className={headerCellClassName}>
              Latest
            </th>
            <th scope="col" className={clsx(headerCellClassName, "w-[22%]")}>
              {view.impactColumnName}
            </th>
            <th
              scope="col"
              className={clsx(headerCellClassName, "w-[84px] text-right")}
            >
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="group relative">
              <td className={cellClassName(index)}>
                <span className="flex items-center gap-2.5">
                  <InitialsAvatar initials={row.name.charAt(0)} size="sm" />
                  <span className="flex min-w-0 flex-col">
                    {row.hasPage ? (
                      <AppLink
                        route={view.rowRoute}
                        slug={row.slug}
                        className="truncate text-sm font-medium text-ink-100 after:absolute after:inset-0"
                      >
                        {row.name}
                      </AppLink>
                    ) : (
                      <span className="truncate text-sm font-medium text-ink-100">
                        {row.name}
                      </span>
                    )}
                    <span className="truncate text-xs text-ink-400">
                      {row.kind}
                    </span>
                  </span>
                </span>
              </td>
              <td
                className={cellClassName(
                  index,
                  "text-right font-medium text-ink-100"
                )}
              >
                {row.reportCount}
              </td>
              <td className={cellClassName(index)}>
                <span className="flex min-w-0 items-center gap-2">
                  {row.isNew && <Pill>New</Pill>}
                  <span className="truncate text-ink-100">{row.latest}</span>
                </span>
              </td>
              <td className={cellClassName(index, "truncate text-ink-500")}>
                {row.impact}
              </td>
              <td className={cellClassName(index, "text-right text-ink-400")}>
                {row.updated}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
