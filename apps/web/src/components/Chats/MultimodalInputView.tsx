"use client";

import React, { forwardRef } from "react";
import { PiPaperPlaneTilt, PiPlus, PiX } from "react-icons/pi";
import { Button } from "@sandworm/ui/components/button";
import TextareaAutosize from "react-textarea-autosize";

import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";

import { ModelQuickSelect } from "../Editor/blocks/ModelQuickSelect";
import { useOpenRouterModels } from "../Editor/hooks/useOpenRouterModel";
import { ModelPickerModal } from "../Editor/blocks/ModelPicker";

import { StopIcon, LoaderIcon } from "./icons";
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
  isCreatingNotebook?: boolean;
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
      isCreatingNotebook = false,
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

    const isInputLocked = disabled || isCreatingNotebook;

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

    transition-all duration-300 ease-in-out font-tertiary text-[13px] 
  "
          >
            {isCreatingNotebook && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-base-100/85 dark:bg-[#30302E]/85 backdrop-blur-[1px]"
                aria-busy="true"
                aria-label="Creating notebook"
              >
                <span className="animate-spin text-primary">
                  <LoaderIcon size={28} />
                </span>
              </div>
            )}

            <TextareaAutosize
              ref={ref}
              placeholder="Start a query..."
              value={input}
              onChange={onInputChange}
              disabled={isInputLocked}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !isLoading && !isInputLocked) {
                    onSubmit?.();
                  }
                }
              }}
              minRows={3}
              maxRows={20}
              className="
        w-full
        bg-transparent
        border-none
        focus:ring-0
        resize-none
        pt-4 px-5 pb-2 
        text-sm text-black dark:text-white
        placeholder:text-ink-300 dark:placeholder:text-ink-400
        scrollbar-thin
        outline-none    
    focus:outline-none  placeholder:font-tertiary placeholder:text-[13px]
      "
            />

            <div className="flex flex-row items-center justify-between px-4 pb-3">
              <div className="flex items-center">
                <TooltipV2<HTMLButtonElement>
                  title="Attach Files"
                  active
                  position="bottom"
                >
                  {ref => (
                    <button
                      ref={ref}
                      type="button"
                      onClick={onFileClick}
                      disabled={isInputLocked}
                      className="rounded-full p-2.5 h-fit bg-transparent dark:bg-transparent text-black dark:text-ink-400 border-[#E7EBF0] border hover:bg-[#E8E8E6] dark:hover:bg-[#2A2A28] dark:border-border-tertiary transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none"
                      title="Attach files"
                    >
                      <PiPlus size={18} />
                    </button>
                  )}
                </TooltipV2>
              </div>

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
                    disabled={isInputLocked}
                  >
                    <StopIcon size={18} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className={`rounded-full p-2.5 h-fit font-light transition-colors ${
                      input.trim() && !isInputLocked
                        ? "text-white bg-primary"
                        : "text-white bg-[#868E96] cursor-not-allowed"
                    }`}
                    onClick={() => input.trim() && !isInputLocked && onSubmit?.()}
                    disabled={isInputLocked}
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
