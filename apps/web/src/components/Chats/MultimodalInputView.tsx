"use client";

import React, { forwardRef } from "react";
import type { Attachment } from "ai";
import { PiPaperPlaneTilt, PiPlus, PiX } from "react-icons/pi";
import { Button } from "@sandworm/ui/components/button";
import { Textarea } from "@sandworm/ui/components/textarea";

import { StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";

interface MultimodalInputUIProps {
  input: string;
  onInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading?: boolean;
  onStop?: () => void;
  attachments?: Array<Attachment>;
  disabled?: boolean;
  onFileClick?: () => void;
  onSubmit?: () => void;
  onRemoveAttachment?: (index: number) => void;
  uploadQueue: string[];
  uploadProgress?: {
    uploaded: number;
    total: number;
  };
  onAbortUpload?: () => void;
}

export const MultimodalInputView = forwardRef<
  HTMLTextAreaElement,
  MultimodalInputUIProps
>(
  (
    {
      input,
      onInputChange,
      isLoading = false,
      onStop,
      attachments = [],
      uploadQueue = [],
      uploadProgress,
      disabled = false,
      onFileClick,
      onSubmit,
      onRemoveAttachment,
      onAbortUpload,
    },
    ref
  ) => {
    return (
      <>
        <div className="relative w-full flex flex-col gap-4">
          <Textarea
            ref={ref}
            placeholder="Start a query..."
            value={input}
            onChange={onInputChange}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading && !disabled) {
                  onSubmit?.();
                }
              }
            }}
            className="
    min-h-[50px]
    overflow-hidden
    resize-none
    rounded-3xl
    border-[1.5px] border-[#E6E0F1]
    bg-base-100 dark:border-border-tertiary
    dark:text-white
    text-sm
    placeholder:text-ink-300 
        dark:placeholder:text-ink-400 

    placeholder:tracking-wide
    py-4 px-5
    focus:outline-none
    focus:border-transparent
    focus:ring-4
   shadow-[0_3.5px_24px_rgba(120,147,208,0.09)] dark:shadow-none
   focus:ring-[rgba(163,8,240,0.2)]
dark:focus:ring-[rgba(163,8,240,0.3)]
    transition-all
    duration-300
    ease-in-out
    scrollbar-thin
    scrollbar-thumb-rounded-md
    scrollbar-thumb-zinc-700
    dark:bg-[#30302E]
  "
            rows={6}
          />

          <div className="absolute bottom-5 left-5">
            <Button
              type="button"
              className="rounded-full p-2.5 h-fit m-0.5 bg-transparent dark:bg-[#30302E] text-black dark:text-ink-400 border-[#B5C8DB] border  hover:bg-[rgba(207,211,222,0.15)] 
    dark:hover:bg-[rgba(255,255,255,0.05)] dark:border-border-tertiary"
              onClick={onFileClick}
            >
              <PiPlus size={18} />
            </Button>
          </div>
          <div className="flex flex-row gap-2 absolute bottom-4 right-5">
            <Button
              type="button"
              className="rounded-full p-2.5 py-2 h-fit m-0.5 text-sm bg-[#E7EBF0] dark:bg-[#363C46] dark:text-[#C5CED9] text-black px-4 font-body  font-medium hidden"
              onClick={onStop}
            >
              Deep Research
            </Button>

            {isLoading ? (
              <Button
                type="button"
                className="rounded-full p-2.5 h-fit m-0.5 text-white bg-primary "
                onClick={onStop}
                disabled={disabled}
              >
                <StopIcon size={18} />
              </Button>
            ) : (
              <Button
                type="button"
                className={`rounded-full p-2.5 h-fit m-0.5 font-light ${
                  input.trim()
                    ? "text-white bg-primary"
                    : "text-white bg-primary/50"
                }`}
                onClick={() => onSubmit?.()}
              >
                <PiPaperPlaneTilt size={18} strokeWidth={0.5} />
              </Button>
            )}
          </div>
        </div>
        {/* Attachments Preview */}
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div className="flex flex-row gap-2 overflow-x-auto pb-2 mt-2">
            {attachments.map((attachment, index) => (
              <div key={attachment.url} className="relative group">
                <PreviewAttachment attachment={attachment} />
                {onRemoveAttachment && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(index)}
                    className="absolute -top-0 -right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove attachment"
                  >
                    <PiX size={12} />
                  </button>
                )}
              </div>
            ))}
            {uploadQueue.map((filename, index) => (
              <PreviewAttachment
                key={filename}
                attachment={{ url: "", name: filename, contentType: "" }}
                isUploading
                uploadProgress={index === 0 ? uploadProgress : undefined}
                onAbort={index === 0 ? onAbortUpload : undefined}
              />
            ))}
          </div>
        )}
      </>
    );
  }
);

MultimodalInputView.displayName = "MultimodalInputView";
