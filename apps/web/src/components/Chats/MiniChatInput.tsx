import type { ChangeEvent, KeyboardEvent } from "react";
import React, { useState, useRef } from "react";
import { Plus, Send, X, FileText, FileSpreadsheet } from "lucide-react";

import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";

interface MiniChatInputProps {
  onSend?: (data: { message: string; files: File[] }) => void;
  placeholder?: string;
  maxHeight?: number;
  acceptedFileTypes?: string;
  disabled: boolean;
}

export const MiniChatInput: React.FC<MiniChatInputProps> = ({
  onSend,
  placeholder = "Create a bar chart with tokens above $1m market cap on Base.",
  maxHeight = 200,
  acceptedFileTypes = ".csv,.pdf,.doc,.docx,.txt,.xls,.xlsx",
  disabled,
}) => {
  const [message, setMessage] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if (message.trim() || files.length > 0) {
      if (onSend) {
        onSend({ message, files });
      } else {
        console.log("Sending:", { message, files });
      }
      setMessage("");
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`;
  };

  const getFileIcon = (file: File): JSX.Element => {
    if (file.type.includes("csv") || file.type.includes("spreadsheet")) {
      return <FileSpreadsheet className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="w-full">
      <div className="bg-[#F1F3F4] dark:bg-[#30302E] border border-border-secondary  rounded-2xl shadow-sm dark:border-border-tertiary">
        {/* File Preview Section */}
        {files.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <div className="text-gray-600">{getFileIcon(file)}</div>
                  <span className="text-gray-700 max-w-[150px] truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-ink-400 hover:text-gray-600 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Area */}
        <div className="px-1.5 pt-1.5 pb-1.5">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none bg-transparent outline-none text-ink-100 dark:text-white pt-1.5 placeholder-text-ink-300 text-sm max-h-[300px] dark:placeholder:text-ink-400 px-3"
            rows={2}
            aria-label="Message input"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-3 pb-3">
          <TooltipV2<HTMLButtonElement>
            title="Attach Files"
            active
            position="bottom"
          >
            {ref => (
              <button
                ref={ref}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-8 h-8  hover:bg-gray-100 text-gray-600 transition-colors border border-[#B5C8DB] dark:bg-[#30302E] bg-white rounded-full dark:text-ink-400 dark:border-transparent"
                title="Attach files"
                aria-label="Attach files"
              >
                <Plus className="w-5 h-5" strokeWidth={1.2} />
              </button>
            )}
          </TooltipV2>

          <button
            type="button"
            onClick={handleSend}
            disabled={(!message.trim() && files.length === 0) || disabled}
            className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${
              message.trim() || files.length > 0
                ? "bg-[#A308F0]  hover:bg-[#A308F0]  text-white"
                : "bg-white dark:bg-[#30302E] text-ink-400 cursor-not-allowed border border-[#DEE2E6] dark:border-border-tertiary"
            }`}
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes}
            onChange={handleFileSelect}
            className="hidden"
            aria-label="File input"
          />
        </div>
      </div>
    </div>
  );
};
