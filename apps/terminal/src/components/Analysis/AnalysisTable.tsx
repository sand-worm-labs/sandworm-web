import type { ReactNode } from "react";
import clsx from "clsx";
import { AnalysisViewKind } from "@sandworm/types/terminal";
import { Pill } from "@sandworm/ui/kit/pill";

import { AppLink } from "@/components/AppLink";
import { SubjectAvatar } from "@/components/Subject/SubjectAvatar";
import type { AnalysisView } from "@/types";

type AnalysisTableProps = {
  view: AnalysisView;
  rows: AnalysisView["rows"];
};

const KIND_OF_VIEW = {
  projects: AnalysisViewKind.PROJECT,
  regions: AnalysisViewKind.REGION,
  sectors: AnalysisViewKind.SECTOR,
} as const;

const headerCellClassName = "px-3 py-2.5 text-xs font-medium text-ink-400";

function cellClassName(index: number, extra?: string) {
  return clsx(
    "px-3 py-3 align-middle group-hover:bg-hover-bg dark:group-hover:bg-sidebar-hover",
    index > 0 && "border-t border-border-secondary",
    extra
  );
}

// The avatar and name; `children` sits under the name
function RowSubject({
  row,
  view,
  children,
}: {
  row: AnalysisView["rows"][number];
  view: AnalysisView;
  children?: ReactNode;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <SubjectAvatar
        name={row.name}
        icon={row.icon}
        size="md"
        view={KIND_OF_VIEW[view.id]}
      />
      <span className="flex min-w-0 flex-col">
        {row.hasPage ? (
          <AppLink
            route="analysis"
            slug={row.id}
            className="truncate text-sm font-medium text-ink-100 after:absolute after:inset-0"
          >
            {row.name}
          </AppLink>
        ) : (
          <span className="truncate text-sm font-medium text-ink-100">
            {row.name}
          </span>
        )}
        {children}
      </span>
    </span>
  );
}

// A phone gets a list; the table is for a screen wide enough to hold its columns.
export function AnalysisTable({ view, rows }: AnalysisTableProps) {
  return (
    <>
      <ul className="px-2 pb-2 md:hidden">
        {rows.map(row => (
          <li
            key={row.id}
            className="relative flex items-center justify-between gap-3 border-t border-border-secondary px-3 py-3 first:border-t-0"
          >
            <RowSubject row={row} view={view}>
              <span className="flex items-center gap-1.5 text-[13px] text-ink-400">
                {row.isNew && <Pill>New</Pill>}
                <span className="truncate">{row.latest}</span>
              </span>
            </RowSubject>
            <span className="flex shrink-0 flex-col items-end text-xs text-ink-400">
              <span className="text-sm font-medium text-ink-100">
                {row.reportCount}
              </span>
              {row.updated}
            </span>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
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
                Description
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
                  <RowSubject row={row} view={view} />
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
                  {row.kind}
                </td>
                <td className={cellClassName(index, "text-right text-ink-400")}>
                  {row.updated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
