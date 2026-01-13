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
  uploadQueue?: Array<string>;
  disabled?: boolean;
  onFileClick?: () => void;
  onSubmit?: () => void;
  onRemoveAttachment?: (index: number) => void;
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
      disabled = false,
      onFileClick,
      onSubmit,
      onRemoveAttachment,
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
            className="
    min-h-[50px]
    overflow-hidden
    resize-none
    rounded-3xl
    border-[1.5px] border-[#E6E0F1]
    bg-white dark:border-[#262A30]
    dark:bg-[#121417]
    dark:text-white
    text-sm
    placeholder:text-[#868E96]
    placeholder:tracking-wide
    py-4 px-5
    focus:outline-none
    focus:border-transparent
    focus:ring-4
    focus:ring-[rgba(139,69,19,0.2)]
dark:focus:ring-[rgba(255,165,79,0.3)]
    transition-all
    duration-300
    ease-in-out
    scrollbar-thin
    scrollbar-thumb-rounded-md
    scrollbar-thumb-zinc-700
  "
            rows={6}
          />

          <div className="absolute bottom-5 left-5">
            <Button
              type="button"
              className="rounded-full p-2.5 h-fit m-0.5 bg-transparent dark:bg-[#363C46] text-black dark:text-[#C5CED9] border-[#B5C8DB] border  hover:bg-[rgba(207,211,222,0.15)] 
    dark:hover:bg-[rgba(255,255,255,0.05)] dark:border-[#262A30]"
              onClick={onFileClick}
            >
              <PiPlus size={18} />
            </Button>
          </div>
          <div className="flex flex-row gap-2 absolute bottom-5 right-5">
            <Button
              type="button"
              className="rounded-full p-2.5 py-2 h-fit m-0.5 text-sm bg-[#E7EBF0] dark:bg-[#363C46] dark:text-[#C5CED9] text-black px-4 font-primary font-medium hidden"
              onClick={onStop}
            >
              Deep Research
            </Button>

            {isLoading ? (
              <Button
                type="button"
                className="rounded-full p-2.5 h-fit m-0.5 text-white bg-[#A308F0] "
                onClick={onStop}
                disabled={disabled}
              >
                <StopIcon size={18} />
              </Button>
            ) : (
              <Button
                type="button"
                className="rounded-full p-2.5 h-fit m-0.5 text-white bg-[#A308F0]  font-light"
                onClick={() => onSubmit?.()}
              >
                <PiPaperPlaneTilt size={18} strokeWidth={0.5} />
              </Button>
            )}
          </div>
        </div>
        {/* Attachments Preview */}
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div className="flex flex-row gap-2 overflow-x-auto pb-2">
            {attachments.map((attachment, index) => (
              <div key={attachment.url} className="relative group">
                <PreviewAttachment attachment={attachment} />
                {onRemoveAttachment && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(index)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove attachment"
                  >
                    <PiX size={12} />
                  </button>
                )}
              </div>
            ))}
            {uploadQueue.map(filename => (
              <PreviewAttachment
                key={filename}
                attachment={{ url: "", name: filename, contentType: "" }}
                isUploading
              />
            ))}
          </div>
        )}
      </>
    );
  }
);

MultimodalInputView.displayName = "MultimodalInputView";
