"use client";

import React, { forwardRef } from "react";
import { PiPaperPlaneTilt, PiPlus, PiX } from "react-icons/pi";
import { Button } from "@sandworm/ui/components/button";
import TextareaAutosize from "react-textarea-autosize";

import { ModelQuickSelect } from "../Editor/blocks/ModelQuickSelect";
import { useOpenRouterModels } from "../Editor/hooks/useOpenRouterModel";
import { ModelPickerModal } from "../Editor/blocks/ModelPicker";

import { StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";

export interface Attachment {
  name?: string;
  contentType?: string;
  url: string;
  size?: number;
}

interface MultimodalInputUIProps {
  input: string;
  workspaceId: string;
  currentModel?: string;
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
      workspaceId,
      currentModel,
    },
    ref
  ) => {
    const {
      models,
      loading,
      error,
      selectedModelId,
      isPickerOpen,
      openPicker,
      closePicker,
      selectModel,
    } = useOpenRouterModels(workspaceId, currentModel);

    return (
      <>
        <div className="relative w-full flex flex-col gap-4">
          <div
            className="
    relative flex flex-col
    w-full min-h-[120px]
    rounded-3xl
    border-[1.5px] border-[#E6E0F1]
    bg-base-100 dark:border-border-tertiary dark:bg-[#30302E]
    shadow-[0_3.5px_24px_rgba(120,147,208,0.09)] dark:shadow-none
    focus-within:ring-4 focus-within:ring-[rgba(163,8,240,0.2)]
    dark:focus-within:ring-[rgba(163,8,240,0.3)]
    transition-all duration-300 ease-in-out
  "
          >
            <TextareaAutosize
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
              minRows={3}
              maxRows={14}
              className="
        w-full
        bg-transparent
        border-none
        focus:ring-0
        resize-none
        pt-4 px-5 pb-2 /* Small bottom padding for text */
        text-sm text-black dark:text-white
        placeholder:text-ink-300 dark:placeholder:text-ink-400
        scrollbar-thin
        outline-none    
    focus:outline-none 
      "
            />

            <div className="flex flex-row items-center justify-between px-4 pb-3">
              {/* Left Action */}
              <div className="flex items-center">
                <Button
                  type="button"
                  className="rounded-full p-2.5 h-fit bg-transparent dark:bg-transparent text-black dark:text-ink-400 border-[#B5C8DB] border hover:bg-[rgba(207,211,222,0.15)] dark:hover:bg-[rgba(255,255,255,0.05)] dark:border-border-tertiary"
                  onClick={onFileClick}
                >
                  <PiPlus size={18} />
                </Button>
              </div>

              {/* Right Actions */}
              <div className="flex flex-row gap-2 items-center">
                <ModelQuickSelect
                  models={models}
                  selectedModelId={selectedModelId}
                  onSelect={selectModel}
                  onBrowseAll={openPicker}
                />

                {isLoading ? (
                  <Button
                    type="button"
                    className="rounded-full p-2.5 h-fit text-white bg-primary"
                    onClick={onStop}
                    disabled={disabled}
                  >
                    <StopIcon size={18} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className={`rounded-full p-2.5 h-fit font-light transition-colors ${
                      input.trim()
                        ? "text-white bg-primary"
                        : "text-white bg-primary/30 cursor-not-allowed"
                    }`}
                    onClick={() => input.trim() && onSubmit?.()}
                  >
                    <PiPaperPlaneTilt size={18} strokeWidth={0.5} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div className="flex flex-row gap-2 overflow-x-auto pb-2 mt-2">
            {attachments.map((attachment, index) => (
              <div key={attachment.url} className="relative group">
                <PreviewAttachment attachment={attachment} />
                {onRemoveAttachment && (
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(index)}
                    className="absolute -top-0 -right-0 bg-error hover:bg-error text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <ModelPickerModal
          isOpen={isPickerOpen}
          onClose={closePicker}
          onSelect={selectModel}
          models={models}
          loading={loading}
          error={error}
          selectedModelId={selectedModelId}
          title="Select Model"
        />
      </>
    );
  }
);

MultimodalInputView.displayName = "MultimodalInputView";
