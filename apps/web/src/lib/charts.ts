import { isValidSuiAddress } from "@mysten/sui/utils";

interface QueryResult {
  columns: string[];
  data: Record<string, any>[];
}

interface AxisGuessResult {
  x: string;
  y: string;
}

export function getDefaultAxis(
  result: QueryResult,
  chartType: any,
): AxisGuessResult | null {
  const { columns, data } = result;
  if (!columns || columns.length === 0 || !data || data.length === 0)
    return null;

  const sample = data[0];
  const numericCols = columns.filter(
    (col) =>
      typeof sample[col] === "number" || !Number.isNaN(Number(sample[col])),
  );

  switch (chartType) {
    case "bar":
    case "area": {
      if (numericCols.length === 0 || columns.length < 2) return null;
      const y = numericCols[0];
      const x = columns.find((col) => col !== y) || columns[1];
      return { x, y };
    }
    case "pie": {
      if (numericCols.length === 0 || columns.length < 2) return null;
      const y = numericCols[0];
      const x = columns.find((col) => col !== y) || columns[1];
      return { x, y };
    }
    default:
      return null;
  }
}

export function validateChart(
  result: QueryResult,
  chartType: any,
): { isValid: boolean; reason?: string } {
  const { columns, data } = result;
  if (!columns || columns.length < 2)
    return { isValid: false, reason: "Not enough columns for visualization." };
  if (!data || data.length === 0)
    return { isValid: false, reason: "No data to display." };

  const sample = data[0];
  const numericCols = columns.filter(
    (col) =>
      typeof sample[col] === "number" || !Number.isNaN(Number(sample[col])),
  );

  switch (chartType) {
    case "pie":
      if (numericCols.length === 0)
        return {
          isValid: false,
          reason: "Pie chart needs at least one numeric column.",
        };
      return { isValid: true };
    case "bar":
      if (numericCols.length === 0)
        return {
          isValid: false,
          reason: "Bar chart needs at least one numeric column.",
        };
      return { isValid: true };
    case "area":
      if (numericCols.length === 0)
        return {
          isValid: false,
          reason: "Area chart needs at least one numeric column.",
        };
      if (columns.length < 2)
        return {
          isValid: false,
          reason: "Area chart needs two columns (x and y).",
        };
      return { isValid: true };
    default:
      return { isValid: false, reason: "Unknown chart type." };
  }
}

// wtf is this?
export function sanitizeChartData(
  result: QueryResult,
  xKey: string,
  yKey: string,
): { x: any; y: number }[] {
  return result.data
    .map((row) => {
      const xRaw = row[xKey];
      const yRaw = row[yKey];

      const xIsAddress = typeof xRaw === "string" && isValidSuiAddress(xRaw);

      const isClearlyNumber =
        typeof xRaw === "number" ||
        (!xIsAddress && !Number.isNaN(Number(xRaw)));

      const x = isClearlyNumber ? Number(xRaw) : xRaw;
      const y = Number(yRaw);

      if (Number.isNaN(y)) return null;
      return { x, y };
    })
    .filter(Boolean) as { x: any; y: number }[];
}
