"use client";

import type { Attachment, ChatRequestOptions, CreateUIMessage } from "ai";
import type { Dispatch, SetStateAction, ChangeEvent } from "react";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import useWindowSize from "./use-window-size";
import { MultimodalInputView } from "./MultimodalInputView";

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<any>;
  append?: (
    message: any | CreateUIMessage,
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
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return;

    handleSubmit(undefined, { experimental_attachments: attachments });
    setAttachments([]);
    setInput("");

    if (width && width > 768) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [input, attachments, handleSubmit, setAttachments, setInput, width]);

  const uploadFile = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);

      return {
        url,
        name: file.name,
        contentType: file.type,
      };
    } catch (error) {
      toast.error("Failed to process file, please try again!");
      return undefined;
    }
  };

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

      setUploadQueue(validFiles.map(file => file.name));

      try {
        const uploadPromises = validFiles.map(file => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successful = uploadedAttachments.filter(Boolean) as Attachment[];

        setAttachments(current => [...current, ...successful]);

        if (successful.length > 0) {
          toast.success(`Successfully uploaded ${successful.length} file(s)`);
        }
      } catch (error) {
        console.error("Error uploading files!", error);
        toast.error("Error uploading files");
      } finally {
        setUploadQueue([]);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [setAttachments]
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

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-4">
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        accept=".csv,text/csv,application/pdf,image/*,.txt,.json"
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <MultimodalInputView
        ref={textareaRef}
        input={input}
        onInputChange={handleInput}
        isLoading={isLoading}
        onSubmit={submitForm}
        onStop={stop}
        attachments={attachments}
        uploadQueue={uploadQueue}
        onFileClick={handleFileClick}
        onRemoveAttachment={handleRemoveAttachment}
      />
    </div>
  );
}
