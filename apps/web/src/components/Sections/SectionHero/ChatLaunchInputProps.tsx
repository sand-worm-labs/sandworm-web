"use client";

import React, { forwardRef } from "react";
import type { Attachment } from "ai";
import { PiPaperPlaneTilt } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PreviewAttachment } from "@/components/Chats/preview-attachment";
import { StopIcon } from "@/components/Chats/icons";

// ⬢ Interface ⬢
// =====================================
interface ChatLaunchInputProps {
  input: string;
  onInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (e?: React.FormEvent) => void;
  isLoading?: boolean;
  onStop?: () => void;
  attachments?: Array<Attachment>;
  uploadQueue?: Array<string>;
  disabled?: boolean;
}

// ⬢ Component ⬢
// =====================================
export const ChatLaunchInput = forwardRef<
  HTMLTextAreaElement,
  ChatLaunchInputProps
>(
  (
    {
      input,
      onInputChange,
      onSubmit,
      isLoading = false,
      onStop,
      attachments = [],
      uploadQueue = [],
      disabled = false,
    },
    ref
  ) => {
    return (
      <div className="relative w-full flex flex-col gap-4 ">
        {attachments.length === 0 && uploadQueue.length === 0 && (
          <div className="grid sm:grid-cols-2 gap-4 w-full md:px-0 mx-auto md:max-w-[700px]" />
        )}

        {/* ════════════ Attachement Preview ════════════ */}
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

        {/* ════════════ Textarea ════════════ */}
        <div className="p-1.5 bg-rainbow-gradient rounded-4xl">
          <Textarea
            ref={ref}
            placeholder="Start  a  query . . ."
            value={input}
            onChange={onInputChange}
            onKeyDown={undefined}
            className="min-h-[50px] overflow-hidden resize-none  bg-custom-dark-gray  text-sm placeholder:text-sm focus:ring-0 focus:outline-none   scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-zinc-700 py-4 px-5 placeholder:text-neutral-500 placeholder:tracking-wide rounded-3.5xl"
            rows={6}
          />
        </div>

        {/* ════════════ Action buttons ════════════ */}
        <div className="flex flex-row gap-2 absolute bottom-5 right-5">
          <Button
            type="button"
            className="rounded-full p-2.5 py-2 h-fit m-0.5 text-sm bg-custom-medium-gray text-white px-4"
            onClick={onStop}
          >
            Deep Research
          </Button>

          {isLoading ? (
            <Button
              type="button"
              className="rounded-full p-2.5 h-fit m-0.5 text-white bg-custom-medium-gray"
              onClick={onStop}
              disabled={disabled}
            >
              <StopIcon size={16} />
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-full p-2.5 h-fit m-0.5 text-white bg-custom-medium-gray"
              onClick={onSubmit}
            >
              <PiPaperPlaneTilt size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

ChatLaunchInput.displayName = "ChatLaunchInput";
