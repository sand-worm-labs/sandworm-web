"use client";

import type { Attachment } from "ai";
import {
  PiFile,
  PiFileText,
  PiFileCsv,
  PiFilePdf,
  PiImage,
  PiX,
} from "react-icons/pi";
import { Loader2 } from "lucide-react";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  uploadProgress,
  onAbort,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  uploadProgress?: {
    uploaded: number;
    total: number;
  };
  onAbort?: () => void;
}) => {
  const { name, url, contentType } = attachment;

  const progressPercent = uploadProgress
    ? Math.round((uploadProgress.uploaded / uploadProgress.total) * 100)
    : 0;

  const getFileIcon = () => {
    if (!contentType && name) {
      if (name.endsWith(".csv")) return <PiFileCsv size={24} />;
      if (name.endsWith(".pdf")) return <PiFilePdf size={24} />;
      if (name.endsWith(".txt")) return <PiFileText size={24} />;
    }

    if (contentType?.startsWith("image/")) return <PiImage size={24} />;
    if (contentType === "text/csv" || name?.endsWith(".csv"))
      return <PiFileCsv size={24} />;
    if (contentType === "application/pdf") return <PiFilePdf size={24} />;
    if (contentType === "text/plain") return <PiFileText size={24} />;

    return <PiFile size={24} />;
  };

  const getFileName = () => {
    if (!name) return "Unnamed file";
    const parts = name.split("/");
    return parts[parts.length - 1] || name;
  };

  const isImage = contentType?.startsWith("image/");

  return (
    <div className="flex flex-col items-center gap-2 min-w-[100px] max-w-[140px] py-2">
      <div
        className={`
          relative flex items-center justify-center
          w-full aspect-square
          rounded-xl
          border-2
          ${
            isUploading
              ? "border-dashed border-gray-300 dark:border-border-tertiary bg-gray-50 dark:bg-editor-600"
              : "border-border-secondary dark:border-border-tertiary  bg-white dark:bg-editor-600"
          }
          overflow-hidden
          transition-all
          hover:border-primary
          dark:hover:border-primary
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 p-2 w-full">
            <Loader2 className="w-6 h-6 text-ink-400 animate-spin" />
            {uploadProgress && (
              <div className="w-full px-2">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-center text-ink-400  mt-1">
                  {progressPercent}%
                </p>
              </div>
            )}
          </div>
        ) : isImage && url ? (
          <img
            src={url}
            alt={getFileName()}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center text-gray-600 dark:text-ink-400">
            {getFileIcon()}
          </div>
        )}

        {/* Abort button for uploading files */}
        {isUploading && onAbort && (
          <button
            type="button"
            onClick={onAbort}
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors"
            aria-label="Cancel upload"
          >
            <PiX size={12} />
          </button>
        )}
      </div>

      <div className="w-full px-1">
        <p className="text-xs text-center text-gray-700 dark:text-gray-300 truncate w-full">
          {getFileName()}
        </p>
        {!isUploading && contentType && (
          <p className="text-[10px] text-center text-ink-400  dark:text-ink-400  truncate w-full">
            {contentType.split("/")[1]?.toUpperCase() || "FILE"}
          </p>
        )}
        {isUploading && !uploadProgress && (
          <p className="text-[10px] text-center text-ink-400  dark:text-ink-400 ">
            Queued...
          </p>
        )}
      </div>
    </div>
  );
};
