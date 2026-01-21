"use client";

import React, { forwardRef } from "react";
import type { Attachment } from "ai";
import { PiPaperPlaneTilt } from "react-icons/pi";
import { Button } from "@sandworm/ui/components/button";
import { Textarea } from "@sandworm/ui/components/textarea";

import { PreviewAttachment } from "@/components/Chats/preview-attachment";
import { StopIcon } from "@/components/Chats/icons";
import { Binocular } from "@/components/Assets/Binocular";

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
          <div className="grid sm:grid-cols-2 gap-4 w-full md:px-0 mx-auto md:max-w-[650px]" />
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
        <div className="p-[4.5px] bg-rainbow-gradient rounded-[24px]">
          <Textarea
            ref={ref}
            placeholder="Start a query..."
            value={input}
            onChange={onInputChange}
            onKeyDown={undefined}
            className="min-h-[40px] overflow-hidden resize-none  bg-hero-base  text-sm placeholder:text-[13px] font-medium focus:ring-0 focus:outline-none   scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-zinc-700 py-4 px-6 placeholder:text-neutral-500 placeholder:tracking-wide rounded-[23px] border-0 "
            rows={4}
          />
        </div>

        {/* ════════════ Action buttons ════════════ */}
        <div className="flex flex-row gap-2 absolute bottom-5 right-5">
          <Button
            type="button"
            className="rounded-full p-2.5 py-[7px] h-fit m-0.5 text-xs bg-gray-100  text-custom-light-gray-2 px-4 flex"
            onClick={onStop}
          >
            <Binocular className="w-5 h-5" />
            <span>Deep Research</span>
          </Button>

          {isLoading ? (
            <Button
              type="button"
              className="rounded-full p-2 h-fit m-0.5 text-custom-light-gray-2 bg-custom-medium-gray"
              onClick={onStop}
              disabled={disabled}
            >
              <StopIcon size={16} />
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-full p-2.5 h-fit m-0.5 text-custom-light-gray-2 bg-primary"
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
