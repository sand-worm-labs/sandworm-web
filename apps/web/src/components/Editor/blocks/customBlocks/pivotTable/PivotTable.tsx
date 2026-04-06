import type { Json, PivotTableSort, PivotTableResult } from "@sandworm/types";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";
import { equals } from "ramda";
import { useCallback } from "react";

import ScrollBar from "../../ScrollBar";

// =====================================
// ⬢ Utils
// =====================================

function renderJson(j?: Json): string {
  if (j === undefined) {
    return "-";
  }

  if (typeof j === "object") {
    return JSON.stringify(j);
  }

  return j.toString();
}

// =====================================
// ⬢ Types
// =====================================

interface TreeNode {
  name: string;
  value: Json;
  parent: TreeNode | null;
  children: TreeNode[];
  colIndex: number;
}

// =====================================
// ⬢ Tree Helpers
// =====================================

// FIX no-use-before-define: moved getColSpan and calculateMaxDepth above renderHeaders
const getColSpan = (node: TreeNode): number => {
  if (node.children.length === 0) {
    return 1;
  }
  return node.children.reduce((sum, child) => sum + getColSpan(child), 0);
};

const calculateMaxDepth = (node: TreeNode): number => {
  if (node.children.length === 0) {
    return 1;
  }
  return 1 + Math.max(...node.children.map(calculateMaxDepth));
};

function buildTree(columns: Json[][]): TreeNode[] {
  const root: TreeNode[] = [];

  columns.forEach((columnPath, colIndex) => {
    let currentLevel = root;
    const [metric, ...categories] = columnPath;
    let parent: TreeNode | null = null;

    categories.forEach(category => {
      let node = currentLevel.find(n => n.name === renderJson(category));
      if (!node) {
        node = {
          name: renderJson(category),
          value: category,
          children: [],
          colIndex: -1,
          parent,
        };
        currentLevel.push(node);
      }
      parent = node;
      currentLevel = node.children;
    });

    currentLevel.push({
      name: renderJson(metric),
      value: metric ?? null,
      children: [],
      colIndex,
      parent,
    });
  });

  return root;
}

// =====================================
// ⬢ Header Renderers
// =====================================

const renderHeaders = (
  nodes: TreeNode[],
  depth: number,
  maxDepth: number,
  columnNames: string[],
  lastRow: string,
  sort: PivotTableSort | null,
  onSortByRow: (row: string) => void,
  onSortByColumn: (node: TreeNode, order: "asc" | "desc" | "none") => void
): JSX.Element => {
  let rowSortDirection: "asc" | "desc" | "none" = "none";
  if (sort && sort._tag === "row" && sort.row === lastRow) {
    rowSortDirection = sort.order;
  }

  return (
    <>
      {columnNames[depth] ? (
        <th
          key={`${depth}-row-label`}
          className="border-b border-r px-2 py-1.5 text-ink-400  whitespace-nowrap font-normal"
          align="right"
        >
          {columnNames[depth]}
        </th>
      ) : (
        <th
          key={`${depth}-row-sort`}
          className="border-b border-r px-2 py-1.5 text-ink-400  whitespace-nowrap font-normal hover:cursor-pointer hover:bg-gray-100"
          align="right"
          onClick={() => {
            onSortByRow(lastRow);
          }}
        >
          <div className="flex justify-between items-center space-x-2.5">
            <div>{lastRow}</div>
            <div>
              {rowSortDirection === "asc" && (
                <ArrowUpIcon className="w-3 h-3" />
              )}
              {rowSortDirection === "desc" && (
                <ArrowDownIcon className="w-3 h-3" />
              )}
              {rowSortDirection === "none" && (
                <ArrowsUpDownIcon className="w-3 h-3 text-gray-300" />
              )}
            </div>
          </div>
        </th>
      )}
      {nodes.map(node => {
        let sortDirection: "asc" | "desc" | "none" = "none";
        if (sort && sort._tag === "column") {
          if (sort.metric === node.name) {
            const columnValues: Json[] = [];
            let { parent } = node;
            while (parent) {
              columnValues.unshift(parent.value);
              parent = parent.parent;
            }
            if (equals(sort.columnValues, columnValues)) {
              sortDirection = sort.order;
            }
          }
        }

        const nextSortDirection =
          sortDirection === "none"
            ? "desc"
            : sortDirection === "desc"
              ? "asc"
              : "none";

        const hasChildren = node.children.length > 0;
        return (
          <th
            key={`${depth}-${node.name}-${node.colIndex}`}
            colSpan={hasChildren ? getColSpan(node) : 1}
            rowSpan={hasChildren ? 1 : maxDepth - depth + 1}
            className={clsx(
              "border-b border-r px-2 py-1.5 text-ink-400  whitespace-nowrap font-normal",
              !hasChildren && "hover:cursor-pointer hover:bg-gray-100"
            )}
            onClick={
              hasChildren
                ? undefined
                : () => {
                    onSortByColumn(node, nextSortDirection);
                  }
            }
          >
            <div className="flex justify-between items-center space-x-2.5">
              <div>{node.name}</div>
              {!hasChildren && (
                <div>
                  {sortDirection === "asc" && (
                    <ArrowUpIcon className="w-3 h-3" />
                  )}
                  {sortDirection === "desc" && (
                    <ArrowDownIcon className="w-3 h-3" />
                  )}
                  {sortDirection === "none" && (
                    <ArrowsUpDownIcon className="w-3 h-3 text-gray-300" />
                  )}
                </div>
              )}
            </div>
          </th>
        );
      })}
    </>
  );
};

const renderAllHeaders = (
  pivotRows: string[],
  pivotColumns: string[],
  nodes: TreeNode[],
  maxDepth: number,
  sort: PivotTableSort | null,
  onSortByRow: (row: string) => void,
  onSortByColumn: (node: TreeNode, order: "asc" | "desc" | "none") => void,
  depth: number = 0
): JSX.Element[] => {
  if (!nodes.length) return [];

  return [
    <tr key={`header-${depth}`}>
      {depth === 0 &&
        pivotRows.slice(0, -1).map(rowName => {
          let sortDirection: "asc" | "desc" | "none" = "none";
          if (sort && sort._tag === "row" && sort.row === rowName) {
            sortDirection = sort.order;
          }

          return (
            <th
              key={`row-header-label-${rowName}`}
              rowSpan={maxDepth}
              className="border-b border-r px-2 py-1.5 text-ink-400  whitespace-nowrap font-normal hover:cursor-pointer hover:bg-gray-100"
              align="right"
              onClick={() => {
                onSortByRow(rowName);
              }}
            >
              <div className="flex justify-between items-center space-x-2.5">
                <div>{rowName}</div>
                <div>
                  {sortDirection === "asc" && (
                    <ArrowUpIcon className="w-3 h-3" />
                  )}
                  {sortDirection === "desc" && (
                    <ArrowDownIcon className="w-3 h-3" />
                  )}
                  {sortDirection === "none" && (
                    <ArrowsUpDownIcon className="w-3 h-3 text-gray-300" />
                  )}
                </div>
              </div>
            </th>
          );
        })}
      {renderHeaders(
        nodes,
        depth,
        maxDepth,
        pivotColumns,
        pivotRows.at(-1) ?? "",
        sort,
        onSortByRow,
        onSortByColumn
      )}
    </tr>,
    ...renderAllHeaders(
      pivotRows,
      pivotColumns,
      nodes.flatMap(node => node.children),
      maxDepth,
      sort,
      onSortByRow,
      onSortByColumn,
      depth + 1
    ),
  ];
};

// =====================================
// ⬢ Props
// =====================================

interface Props {
  result: PivotTableResult;
  sort: PivotTableSort | null;
  onSort: (sort: PivotTableSort | null) => void;
}

// =====================================
// ⬢ Component
// =====================================

function PivotTable(props: Props) {
  const tree = buildTree(props.result.data.columns);
  const maxDepth = calculateMaxDepth({
    name: "",
    value: "",
    children: tree,
    colIndex: -1,
    parent: null,
  });

  const renderCells = (node: TreeNode, rowIndex: number): JSX.Element[] => {
    if (node.children.length === 0) {
      return [
        <td
          key={`cell-${rowIndex}-${node.colIndex}`}
          className="border-b border-r px-2 py-1.5 text-ink-400  whitespace-nowrap font-normal"
        >
          {renderJson(props.result.data.data[rowIndex]?.[node.colIndex])}
        </td>,
      ];
    }

    return node.children.flatMap(child => renderCells(child, rowIndex));
  };

  const renderBodyRows = () => {
    return props.result.data.index.map(rowHeader => {
      const rowKey = `row-${JSON.stringify(rowHeader)}`;
      const headers = Array.isArray(rowHeader) ? rowHeader : [rowHeader];

      return (
        <tr key={rowKey}>
          {headers.map(header => (
            <td
              key={`row-header-${JSON.stringify(rowHeader)}-${JSON.stringify(header)}`}
              className="border-b border-r px-2 py-1.5 text-ink-400  whitespace-nowrap font-normal"
            >
              {renderJson(header)}
            </td>
          ))}
          {tree.flatMap(node =>
            renderCells(node, props.result.data.index.indexOf(rowHeader))
          )}
        </tr>
      );
    });
  };

  const onSortByRow = useCallback(
    (row: string) => {
      let order: "asc" | "desc" | "none" = "desc";
      if (props.sort && props.sort._tag === "row" && props.sort.row === row) {
        if (props.sort.order === "desc") {
          order = "asc";
        } else if (props.sort.order === "asc") {
          order = "none";
        }
      }

      const sort: PivotTableSort | null =
        order === "none"
          ? null
          : {
              _tag: "row",
              row,
              order,
            };
      props.onSort(sort);
    },
    [props.onSort, props.sort]
  );

  const onSortByColumn = useCallback(
    (node: TreeNode, order: "asc" | "desc" | "none") => {
      const columnValues: Json[] = [];
      let { parent } = node;
      while (parent) {
        columnValues.unshift(parent.value);
        parent = parent.parent;
      }
      const sort: PivotTableSort | null =
        order === "none"
          ? null
          : {
              _tag: "column",
              metric: node.name,
              order,
              columnValues,
            };
      props.onSort(sort);
    },
    [props.onSort]
  );

  return (
    <ScrollBar className="w-full overflow-auto h-full">
      <table className="!w-full text-xs text-left table-auto border-spacing-0 border-separate font-mono">
        <thead className="bg-gray-50 sticky top-0">
          {renderAllHeaders(
            props.result.pivotRows,
            props.result.pivotColumns,
            tree,
            maxDepth,
            props.sort,
            onSortByRow,
            onSortByColumn
          )}
        </thead>
        <tbody>{renderBodyRows()}</tbody>
      </table>
    </ScrollBar>
  );
}

export default PivotTable;
