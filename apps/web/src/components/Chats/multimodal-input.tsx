"use client";

import type { ChatRequestOptions, CreateUIMessage } from "ai";
import type { Dispatch, SetStateAction, ChangeEvent } from "react";
import React, { useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { useFiles } from "../Editor/hooks/useFiles";
import { useWorkspace } from "../Editor/hooks/useWorkspaces";

import useWindowSize from "./use-window-size";
import { MultimodalInputView } from "./MultimodalInputView";

export interface Attachment {
  url: string;
  name?: string;
  contentType?: string;
}

export function MultimodalInput({
  workspaceId,
  input,
  setInput,
  isLoading,
  isCreatingNotebook = false,
  stop,
  attachments,
  setAttachments,
  messages,
  appendAction,
  handleSubmit,
}: {
  workspaceId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isCreatingNotebook?: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<any>;
  appendAction?: (
    message: any | CreateUIMessage<any>,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const [fileState, fileAPI] = useFiles(workspaceId);
  const { workspace } = useWorkspace(workspaceId);
  const currentModel = workspace?.assistantModel;

  console.log(currentModel, workspace, messages, appendAction);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) adjustHeight();
  }, [input]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive upload queue from fileState
  const uploadQueue = React.useMemo(() => {
    if (fileState.upload._tag === "uploading") {
      const currentFile = fileState.upload.current.file.name;
      const restFiles = fileState.upload.rest.map(f => f.name);
      return [currentFile, ...restFiles];
    }
    return [];
  }, [fileState.upload]);

  // Track upload progress and add completed files to attachments
  useEffect(() => {
    const { upload } = fileState;

    // Check for successful uploads in results
    if (upload._tag === "idle" && upload.results.length > 0) {
      const successfulUploads = upload.results.filter(
        r => r.outcome === "success"
      );

      if (successfulUploads.length > 0) {
        // Convert successful uploads to attachments
        const newAttachments: Attachment[] = successfulUploads.map(result => ({
          url: URL.createObjectURL(result.file),
          name: result.file.name,
          contentType: result.file.type,
        }));

        setAttachments(current => [...current, ...newAttachments]);
        toast.success(
          `Successfully uploaded ${successfulUploads.length} file(s)`
        );

        successfulUploads.forEach(result => {
          fileAPI.onRemoveResult(result.file);
        });
      }

      // Handle failed uploads
      const failedUploads = upload.results.filter(
        r => r.outcome === "unexpected"
      );
      if (failedUploads.length > 0) {
        toast.error(`Failed to upload ${failedUploads.length} file(s)`);
        failedUploads.forEach(result => {
          fileAPI.onRemoveResult(result.file);
        });
      }

      const abortedUploads = upload.results.filter(
        r => r.outcome === "aborted"
      );
      abortedUploads.forEach(result => {
        fileAPI.onRemoveResult(result.file);
      });
    }
  }, [fileState.upload, setAttachments, fileAPI]);

  const submitForm = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return;
    if (isCreatingNotebook) return;

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    } as ChatRequestOptions & { experimental_attachments: Attachment[] });
    setAttachments([]);
    setInput("");

    if (width && width > 768) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [
    input,
    attachments,
    handleSubmit,
    setAttachments,
    setInput,
    width,
    isCreatingNotebook,
  ]);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      const allowedTypes = [
        "text/csv",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "text/plain",
        "application/json",
      ];

      const validFiles = files.filter(file => {
        if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv")) {
          toast.error(`File type not supported: ${file.name}`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      fileAPI.onDrop(validFiles);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [fileAPI]
  );

  const handleRemoveAttachment = useCallback(
    (index: number) => {
      setAttachments(current => current.filter((_, i) => i !== index));
    },
    [setAttachments]
  );

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const isAskingReplace =
    fileState.upload._tag === "uploading" &&
    fileState.upload.current.status === "asking-replace";

  const currentUploadingFile =
    fileState.upload._tag === "uploading" ? fileState.upload.current : null;

  return (
    <div className="w-full max-w-3xl mx-auto lg:marker:px-4 mt-4">
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        accept=".csv,text/csv,application/pdf,image/*,.txt,.json"
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {/* File Replace Dialog */}
      {isAskingReplace && currentUploadingFile && (
        <div className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            File "{currentUploadingFile.file.name}" already exists. Replace it?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fileAPI.onReplaceYes}
              className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={fileAPI.onReplaceAll}
              className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            >
              Replace All
            </button>
            <button
              type="button"
              onClick={fileAPI.onReplaceNo}
              className="px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      <MultimodalInputView
        ref={textareaRef}
        currentModel={currentModel}
        workspaceId={workspaceId}
        input={input}
        onInputChange={handleInput}
        isLoading={isLoading}
        isCreatingNotebook={isCreatingNotebook}
        onSubmit={submitForm}
        onStop={stop}
        attachments={attachments}
        uploadQueue={uploadQueue}
        uploadProgress={
          currentUploadingFile
            ? {
                uploaded: currentUploadingFile.uploaded,
                total: currentUploadingFile.total,
              }
            : undefined
        }
        onFileClick={handleFileClick}
        onRemoveAttachment={handleRemoveAttachment}
        onAbortUpload={
          currentUploadingFile
            ? () => fileAPI.onAbort(currentUploadingFile.file)
            : undefined
        }
      />
    </div>
  );
}
