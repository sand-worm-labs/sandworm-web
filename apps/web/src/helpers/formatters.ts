import type { QueryResult } from "@/store";

/* @check if query has result */
export const queryHasResults = (
  result: Record<string, unknown> | unknown[]
): boolean => {
  // Case 1: If result is a plain array (e.g. from 'indexed')
  if (Array.isArray(result)) {
    return result.length > 0;
  }

  // Case 2: If result is an object with known keys
  const knownKeys = [
    "transaction",
    "log",
    "account",
    "block",
    "object",
    "coin",
  ];
  return knownKeys.some(
    key =>
      Array.isArray((result as Record<string, unknown>)[key]) &&
      ((result as Record<string, unknown>)[key] as unknown[]).length > 0
  );
};

/**
 * Converts API results into a structured query result.
 * - Merges all result arrays (transaction, log, account, block) into a single dataset.
 * - Extracts column names from the first object.
 * - Determines column types based on the first object's values.
 * - Formats the data as an array of objects.
 * - Returns the columns, column types, data, and row count.
 */
export const formatApiResultToQueryResult = (
  result: Record<string, object[]> | object[]
): QueryResult => {
  let allData: Array<Record<string, unknown>> = [];

  // If it's a flat array (indexed result)
  if (Array.isArray(result)) {
    allData = result as Record<string, unknown>[];
  } else {
    // Otherwise, loop through the known keys and concat the arrays
    Object.keys(result).forEach(key => {
      if (Array.isArray(result[key]) && result[key].length > 0) {
        allData.push(...(result[key] as Record<string, unknown>[]));
      }
    });
  }

  if (allData.length === 0) {
    return {
      columns: [],
      columnTypes: [],
      data: [],
      rowCount: 0,
    };
  }

  const columns = Object.keys(allData[0]);

  const columnTypes = columns.map(col => {
    const value = allData[0][col];
    let columnType: string;

    if (
      Array.isArray(value) &&
      value.length === 1 &&
      typeof value[0] === "number"
    ) {
      columnType = "number";
    } else if (typeof value === "number") {
      columnType = "number";
    } else {
      columnType = "string";
    }

    return columnType;
  });

  const data = allData.map((item: Record<string, unknown>) => {
    const row: Record<string, unknown> = {};
    columns.forEach(col => {
      row[col] =
        Array.isArray(item[col]) && item[col].length === 1
          ? item[col][0]
          : (item[col] ?? null);
    });
    return row;
  });

  return {
    columns,
    columnTypes,
    data,
    rowCount: data.length,
  };
};
