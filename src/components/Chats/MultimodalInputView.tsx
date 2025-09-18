"use client";

import React, { forwardRef } from "react";
import type { Attachment } from "ai";

import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

import { StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { FaPaperPlane } from "react-icons/fa6";

interface MultimodalInputUIProps {
  input: string;
  onInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading?: boolean;
  onSubmit?: () => void;
  onStop?: () => void;
  attachments?: Array<Attachment>;
  uploadQueue?: Array<string>;
  disabled?: boolean;
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
      onSubmit,
      onStop,
      attachments = [],
      uploadQueue = [],
      disabled = false,
    },
    ref
  ) => {
    return (
      <div className="relative w-full flex flex-col gap-4">
        {/* Empty state spacing */}
        {attachments.length === 0 && uploadQueue.length === 0 && (
          <div className="grid sm:grid-cols-2 gap-4 w-full md:px-0 mx-auto md:max-w-[700px]" />
        )}

        {/* Attachments Preview */}
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div className="flex flex-row gap-2 overflow-x-scroll">
            {attachments.map(attachment => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}

            {uploadQueue.map(filename => (
              <PreviewAttachment
                key={filename}
                attachment={{
                  url: "",
                  name: filename,
                  contentType: "",
                }}
                isUploading
              />
            ))}
          </div>
        )}

        {/* Textarea */}
        <Textarea
          ref={ref}
          placeholder="What are the most active NFT collections on Base in the last 7 days?"
          value={input}
          onChange={onInputChange}
          disabled={disabled}
          className="min-h-[50px] overflow-hidden resize-none rounded-3xl border border-[#E6E0F1] bg-white text-white text-sm placeholder:text-sm  focus:ring-0  focus:outline-none focus:border-none dark:bg-zinc-950/10 dark:text-white dark:placeholder:text-zinc-400 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-zinc-700 py-4 px-5 placeholder:text-[#868E96] focus:border-orange-500 focus:ring-orange-500"
          rows={6}
        />

        {/* Action Button */}

        <div className="flex flex-row gap-2 absolute bottom-5 right-5">
          <Button
            className="rounded-full p-2.5 h-fit m-0.5  text-sm bg-[#E7EBF0] text-black px-4 border-[#B5C8DB] border"
            onClick={onStop}
          >
            Deep Research
          </Button>

          {isLoading ? (
            <Button
              className="rounded-full p-2.5 h-fit  m-0.5 text-white"
              onClick={onStop}
              disabled={disabled}
            >
              <StopIcon size={16} />
            </Button>
          ) : (
            <Button
              className="rounded-full p-2.5 h-fit m-0.5 text-white"
              onClick={onSubmit}
              disabled={
                disabled || input.length === 0 || uploadQueue.length > 0
              }
            >
              <FaPaperPlane size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

MultimodalInputView.displayName = "MultimodalInputView";
