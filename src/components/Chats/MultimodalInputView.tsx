"use client";

import React, { forwardRef } from "react";
import type { Attachment } from "ai";
import { PiPaperPlaneTilt } from "react-icons/pi";

import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

import { StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";

interface MultimodalInputUIProps {
  input: string;
  onInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading?: boolean;
  onSubmit?: (e?: React.FormEvent) => void;
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
                attachment={{ url: "", name: filename, contentType: "" }}
                isUploading
              />
            ))}
          </div>
        )}

        {/* Textarea */}
        <Textarea
          ref={ref}
          placeholder="Start  a  query . . ."
          value={input}
          onChange={onInputChange}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit?.(e as any);
            }
          }}
          className="min-h-[50px] overflow-hidden resize-none rounded-3xl border border-[#E6E0F1] bg-white dark:text-white text-sm placeholder:text-sm focus:ring-0 focus:outline-none dark:bg-zinc-950/10 dark:placeholder:text-zinc-400 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-zinc-700 py-4 px-5 placeholder:text-[#868E96] placeholder:tracking-wide"
          rows={6}
        />

        {/* Action Buttons */}
        <div className="flex flex-row gap-2 absolute bottom-5 right-5">
          <Button
            type="button"
            className="rounded-full p-2.5 py-2 h-fit m-0.5 text-sm bg-[#E7EBF0] text-black px-4 border-[#B5C8DB] border"
            onClick={onStop}
          >
            Deep Research
          </Button>

          {isLoading ? (
            <Button
              type="button"
              className="rounded-full p-2.5 h-fit m-0.5 text-white bg-[#C7665C]"
              onClick={onStop}
              disabled={disabled}
            >
              <StopIcon size={16} />
            </Button>
          ) : (
            <Button
              type="submit"
              className="rounded-full p-2.5 h-fit m-0.5 text-white bg-[#C7665C]"
              disabled={
                disabled || input.length === 0 || uploadQueue.length > 0
              }
            >
              <PiPaperPlaneTilt size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

MultimodalInputView.displayName = "MultimodalInputView";
