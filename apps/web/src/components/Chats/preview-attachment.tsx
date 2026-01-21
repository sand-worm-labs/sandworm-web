"use client";

import type { Attachment } from "ai";
import {
  PiFile,
  PiFileText,
  PiFileCsv,
  PiFilePdf,
  PiImage,
} from "react-icons/pi";
import { Loader2 } from "lucide-react";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;

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
              ? "border-dashed border-gray-300 dark:border-[#262A30] bg-gray-50 dark:bg-[#121417]"
              : "border-gray-200 dark:border-[#262A30]  bg-white dark:bg-[#121417]"
          }
          overflow-hidden
          transition-all
          hover:border-[#A308F0]
          dark:hover:border-[#A308F0]
        `}
      >
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        ) : isImage && url ? (
          <img
            src={url}
            alt={getFileName()}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
            {getFileIcon()}
          </div>
        )}
      </div>

      <div className="w-full px-1">
        <p className="text-xs text-center text-gray-700 dark:text-gray-300 truncate w-full">
          {getFileName()}
        </p>
        {!isUploading && contentType && (
          <p className="text-[10px] text-center text-gray-500 dark:text-gray-500 truncate w-full">
            {contentType.split("/")[1]?.toUpperCase() || "FILE"}
          </p>
        )}
      </div>
    </div>
  );
};
