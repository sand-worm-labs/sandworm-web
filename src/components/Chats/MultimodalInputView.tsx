"use client";

import React, { forwardRef } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ArrowUpIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import type { Attachment } from "ai";

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
          className="min-h-[30px] overflow-hidden resize-none rounded-lg border-none bg-white/10 text-white text-xl placeholder:text-xl/50 focus:ring-0 focus:outline-none focus:border-none dark:bg-zinc-950/10 dark:text-white dark:placeholder:text-zinc-400 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-zinc-700 py-4 px-5"
          rows={5}
        />

        {/* Action Button */}
        {isLoading ? (
          <Button
            className="rounded-full p-1.5 h-fit absolute bottom-2 right-2 m-0.5 text-white"
            onClick={onStop}
            disabled={disabled}
          >
            <StopIcon size={14} />
          </Button>
        ) : (
          <Button
            className="rounded-full p-1.5 h-fit absolute bottom-2 right-2 m-0.5 text-white"
            onClick={onSubmit}
            disabled={disabled || input.length === 0 || uploadQueue.length > 0}
          >
            <ArrowUpIcon size={14} />
          </Button>
        )}
      </div>
    );
  }
);

MultimodalInputView.displayName = "MultimodalInputView";
