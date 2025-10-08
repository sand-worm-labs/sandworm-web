import Papa from "papaparse";

import type { ExportFormat } from "@/types";

export const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }

  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)]),
    );
  }

  return obj;
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const estimateExportSize = (
  data: any[],
  downloadOption: ExportFormat,
): string => {
  if (data.length === 0) return "0 B";

  const sampleSize = Math.min(100, data.length);
  const sample = serializeBigInt(data.slice(0, sampleSize));
  let size: number;

  switch (downloadOption) {
    case "csv":
      size = new Blob([Papa.unparse(sample)]).size * (data.length / sampleSize);
      break;
    case "json":
    case "parquet":
    case "clipboard":
      size =
        new Blob([JSON.stringify(sample)]).size * (data.length / sampleSize);
      break;
    default:
      size = 0;
  }

  return formatBytes(size);
};

export const getSizeWarning = (estimatedSize: string | null): string | null => {
  if (!estimatedSize) return null;

  const [size, unit] = estimatedSize.split(" ");
  const sizeNum = parseFloat(size);

  let sizeInMB = sizeNum;
  switch (unit) {
    case "GB":
      sizeInMB = sizeNum * 1024;
      break;
    case "KB":
      sizeInMB = sizeNum / 1024;
      break;
    case "B":
      sizeInMB = sizeNum / (1024 * 1024);
      break;
    default:
      sizeInMB = sizeNum;
  }

  if (sizeInMB >= 100) {
    return "Warning: The export size is over 100MB. This might take a while and could impact browser performance.";
  }
  if (sizeInMB >= 50) {
    return "Warning: The export size is over 50MB. This might take a while.";
  }
  if (sizeInMB >= 20) {
    return "The export size is over 20MB.";
  }

  return null;
};

export const processInChunks = async (
  items: any[],
  format: ExportFormat,
  chunkSize: number,
  onProgress?: (progress: number) => void,
): Promise<Blob> => {
  const chunks = Math.ceil(items.length / chunkSize);
  let result = "";

  const getContentType = (fmt: ExportFormat): string => {
    switch (fmt) {
      case "csv":
        return "text/csv";
      case "json":
        return "application/json";
      case "parquet":
        return "application/parquet";
      default:
        return "text/plain";
    }
  };

  for (let i = 0; i < chunks; i++) {
    const chunk = serializeBigInt(
      items.slice(i * chunkSize, (i + 1) * chunkSize),
    );

    switch (format) {
      case "csv":
        result +=
          i === 0
            ? Papa.unparse(chunk)
            : Papa.unparse(chunk, { header: false });
        break;
      case "json":
      case "clipboard":
        result +=
          (i === 0 ? "[" : "") +
          chunk.map((item: any) => JSON.stringify(item)).join(",") +
          (i === chunks - 1 ? "]" : "");
        break;
      case "parquet":
        result += "";
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    if (onProgress) {
      onProgress(((i + 1) / chunks) * 100);
    }

    if (i < chunks - 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(requestAnimationFrame);
    }
  }

  return new Blob([result], { type: getContentType(format) });
};
