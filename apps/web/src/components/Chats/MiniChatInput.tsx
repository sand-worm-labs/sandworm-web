import type { ChangeEvent, KeyboardEvent } from "react";
import React, { useState, useRef, useCallback } from "react";
import {
  PiPlus,
  PiPaperPlaneTilt,
  PiX,
  PiFileCsv,
  PiFileText,
  PiAt,
  PiSpinner,
  PiWarningCircle,
} from "react-icons/pi";

import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";

import { ReferencePicker } from "./ReferencePicker";
import { InputReferencePill } from "./ReferencePill";
import ChangesPanelCompact from "./ChangesPanel";
import { DUMMY_BLOCKS } from "./types";
import type { AttachedReference, ReferenceSource } from "./types";
import type { PendingReviewPart } from "./parts.types";

// =====================================
// ⬢ Types
// =====================================

export type UploadedFileRef = {
  name: string;
  path: string;
  size: number;
};

type TrackedFile = {
  localId: string;
  file: File;
  status: "uploading" | "done" | "error";
  ref?: UploadedFileRef;
};

interface MiniChatInputProps {
  onSend?: (data: {
    message: string;
    fileRefs: UploadedFileRef[];
    references: AttachedReference[];
  }) => void;
  onUploadFile?: (file: File) => Promise<UploadedFileRef>;
  placeholder?: string;
  maxHeight?: number;
  acceptedFileTypes?: string;
  disabled: boolean;
  referenceSources?: ReferenceSource[];
  pendingReview?: PendingReviewPart;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
}

// =====================================
// ⬢ Helpers
// =====================================

let _localIdCounter = 0;
function genLocalId() {
  return `tracked-file-${++_localIdCounter}`;
}

// =====================================
// ⬢ File Icon
// =====================================

function FileIcon({ file }: { file: File }) {
  if (file.type.includes("csv") || file.type.includes("spreadsheet")) {
    return <PiFileCsv size={15} />;
  }
  return <PiFileText size={15} />;
}

// =====================================
// ⬢ File Status Indicator
// =====================================

function FileStatusIndicator({ status }: { status: TrackedFile["status"] }) {
  if (status === "uploading") {
    return (
      <span className="text-[#A308F0] animate-spin">
        <PiSpinner size={12} />
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="text-red-400">
        <PiWarningCircle size={12} />
      </span>
    );
  }
  return null;
}

// =====================================
// ⬢ @ Trigger Button
// =====================================

interface AtButtonProps {
  onClick: () => void;
  isActive: boolean;
  disabled: boolean;
}

function AtButton({ onClick, isActive, disabled }: AtButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Reference a block, dataframe, or file"
      aria-pressed={isActive}
      className={`flex items-center justify-center w-7 h-7 rounded-lg
        text-[13px] border transition-all duration-150 select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${
          isActive
            ? "bg-[#F3E6FD] border-[#C97FF5] text-[#7A06B8] dark:bg-[#1F0A2E] dark:border-[#7A06B8] dark:text-[#C97FF5]"
            : "bg-white dark:bg-[#30302E] border-[#B5C8DB] dark:border-transparent text-ink-400 dark:text-ink-500 hover:border-[#C97FF5] hover:text-[#7A06B8] dark:hover:text-[#C97FF5]"
        }`}
    >
      <PiAt size={15} />
    </button>
  );
}

// =====================================
// ⬢ Pill Strip
// =====================================

interface PillStripProps {
  references: AttachedReference[];
  onRemove: (id: string) => void;
}

function PillStrip({ references, onRemove }: PillStripProps) {
  if (references.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 px-3 pt-2.5 pb-0">
      {references.map(ref => (
        <InputReferencePill key={ref.id} reference={ref} onRemove={onRemove} />
      ))}
    </div>
  );
}

// =====================================
// ⬢ Default Sources
// =====================================

const DEFAULT_SOURCES: ReferenceSource[] = [
  { kind: "block", label: "Blocks", items: DUMMY_BLOCKS },
];

// =====================================
// ⬢ MiniChatInput
// =====================================

export const MiniChatInput: React.FC<MiniChatInputProps> = ({
  onSend,
  onUploadFile,
  placeholder = "Create a bar chart with tokens above $1m market cap on Base.",
  maxHeight = 200,
  acceptedFileTypes = ".csv,.pdf,.doc,.docx,.txt,.xls,.xlsx",
  disabled,
  referenceSources = DEFAULT_SOURCES,
  pendingReview,
  onAcceptAll,
  onRejectAll,
}) => {
  // =====================================
  // ⬢ State
  // =====================================

  const [message, setMessage] = useState("");
  const [trackedFiles, setTrackedFiles] = useState<TrackedFile[]>([]);
  const [references, setReferences] = useState<AttachedReference[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // =====================================
  // ⬢ Derived
  // =====================================

  const selectedIds = new Set(references.map(r => r.id));
  const isUploading = trackedFiles.some(f => f.status === "uploading");
  const canSend =
    (message.trim().length > 0 || trackedFiles.length > 0) &&
    !disabled &&
    !isUploading;
  const hasReferencableItems = referenceSources.some(s => s.items.length > 0);

  // =====================================
  // ⬢ Reference Handlers
  // =====================================

  const handleReferenceSelect = useCallback((ref: AttachedReference) => {
    setReferences(prev =>
      prev.some(r => r.id === ref.id) ? prev : [...prev, ref]
    );
    setPickerOpen(false);
    textareaRef.current?.focus();
  }, []);

  const handleReferenceRemove = useCallback((id: string) => {
    setReferences(prev => prev.filter(r => r.id !== id));
  }, []);

  // =====================================
  // ⬢ File Handlers
  // =====================================

  const uploadTrackedFile = useCallback(
    async (tracked: TrackedFile) => {
      if (!onUploadFile) return;

      try {
        const ref = await onUploadFile(tracked.file);
        setTrackedFiles(prev =>
          prev.map(f =>
            f.localId === tracked.localId ? { ...f, status: "done", ref } : f
          )
        );
      } catch {
        setTrackedFiles(prev =>
          prev.map(f =>
            f.localId === tracked.localId ? { ...f, status: "error" } : f
          )
        );
      }
    },
    [onUploadFile]
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const incoming = Array.from(e.target.files ?? []);

      const newTracked: TrackedFile[] = incoming.map(file => ({
        localId: genLocalId(),
        file,
        // If no upload handler provided, mark done immediately (no-op path)
        status: onUploadFile ? ("uploading" as const) : ("done" as const),
      }));

      setTrackedFiles(prev => [...prev, ...newTracked]);

      if (onUploadFile) {
        newTracked.forEach(t => uploadTrackedFile(t));
      }

      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [onUploadFile, uploadTrackedFile]
  );

  const removeTrackedFile = useCallback((localId: string) => {
    setTrackedFiles(prev => prev.filter(f => f.localId !== localId));
  }, []);

  // =====================================
  // ⬢ Send Handler
  // =====================================

  const handleSend = useCallback(() => {
    if (!canSend) return;

    const fileRefs = trackedFiles
      .filter(
        (f): f is TrackedFile & { ref: UploadedFileRef } =>
          f.status === "done" && !!f.ref
      )
      .map(f => f.ref);

    onSend?.({ message, fileRefs, references });

    setMessage("");
    setTrackedFiles([]);
    setReferences([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [canSend, message, trackedFiles, references, onSend]);

  // =====================================
  // ⬢ Textarea Handlers
  // =====================================

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (pickerOpen && e.key === "Escape") {
      e.preventDefault();
      setPickerOpen(false);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !pickerOpen) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`;
  };

  // =====================================
  // ⬢ Pending Review Mapping
  // =====================================

  const pendingChanges = pendingReview?.blocks.map(b => ({
    id: b.blockId,
    type: (b.action === "created" ? "added" : "modified") as
      | "added"
      | "modified"
      | "deleted",
    label: b.blockTitle,
    description: `${b.blockType} · ${b.action}`,
  }));

  // =====================================
  // ⬢ Render
  // =====================================

  return (
    <div className="w-full relative">
      {pickerOpen && (
        <ReferencePicker
          sources={referenceSources}
          selectedIds={selectedIds}
          onSelect={handleReferenceSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <div className="bg-[#F1F3F4] dark:bg-[#30302E] border border-border-secondary dark:border-border-tertiary rounded-2xl shadow-sm">
        {pendingChanges && pendingChanges.length > 0 && (
          <div className="px-0 pt-0 border-b border-[#DEE2E6] dark:border-border-tertiary">
            <ChangesPanelCompact
              changes={pendingChanges}
              onConfirm={onAcceptAll}
              onUndo={onRejectAll}
            />
          </div>
        )}

        {/* ─── File attachments ─── */}
        {trackedFiles.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-b border-[#DEE2E6] dark:border-border-tertiary">
            <div className="flex flex-wrap gap-2">
              {trackedFiles.map(tracked => (
                <div
                  key={tracked.localId}
                  className={`flex items-center gap-2 bg-white dark:bg-[#252523]
                    border rounded-lg px-2.5 py-1.5 transition-colors
                    ${
                      tracked.status === "error"
                        ? "border-red-300 dark:border-red-700"
                        : "border-[#DEE2E6] dark:border-[#3A3A38]"
                    }`}
                >
                  <span className="text-ink-400 dark:text-ink-500">
                    <FileIcon file={tracked.file} />
                  </span>
                  <span className="text-[12px] text-ink-500 dark:text-ink-300 max-w-[140px] truncate">
                    {tracked.file.name}
                  </span>
                  <FileStatusIndicator status={tracked.status} />
                  <button
                    type="button"
                    onClick={() => removeTrackedFile(tracked.localId)}
                    aria-label="Remove file"
                    className="text-ink-300 hover:text-ink-500 dark:hover:text-ink-200 transition-colors"
                  >
                    <PiX size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <PillStrip references={references} onRemove={handleReferenceRemove} />

        <div className="px-1.5 pt-1.5 pb-1.5">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={2}
            aria-label="Message input"
            className="w-full resize-none bg-transparent outline-none
              text-ink-100 dark:text-white text-sm
              placeholder:text-ink-300 dark:placeholder:text-ink-400
              pt-1.5 px-3 max-h-[300px]
              disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1.5">
            <TooltipV2<HTMLButtonElement>
              title="Attach Files"
              active
              position="top"
            >
              {ref => (
                <button
                  ref={ref}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  aria-label="Attach files"
                  className="flex items-center justify-center w-8 h-8 rounded-full
                    bg-white dark:bg-[#30302E]
                    border border-[#B5C8DB] dark:border-transparent
                    text-ink-400 dark:text-ink-500
                    hover:bg-gray-50 dark:hover:bg-[#3A3A38]
                    transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PiPlus size={18} />
                </button>
              )}
            </TooltipV2>

            <TooltipV2<HTMLDivElement>
              title="Add Context"
              active
              position="top"
            >
              {ref => (
                <div ref={ref}>
                  <AtButton
                    onClick={() => setPickerOpen(o => !o)}
                    isActive={pickerOpen || references.length > 0}
                    disabled={disabled || !hasReferencableItems}
                  />
                </div>
              )}
            </TooltipV2>
          </div>

          {/* ─── Send / uploading indicator ─── */}
          <TooltipV2<HTMLButtonElement>
            title={isUploading ? "Uploading files…" : ""}
            active={isUploading}
            position="top"
          >
            {ref => (
              <button
                ref={ref}
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Send message"
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors
                  ${
                    canSend
                      ? "bg-[#A308F0] hover:bg-[#8A06CC] text-white"
                      : "bg-white dark:bg-[#30302E] text-ink-400 cursor-not-allowed border border-[#DEE2E6] dark:border-border-tertiary"
                  }`}
              >
                {isUploading ? (
                  <PiSpinner size={15} className="animate-spin" />
                ) : (
                  <PiPaperPlaneTilt size={15} />
                )}
              </button>
            )}
          </TooltipV2>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFileTypes}
            onChange={handleFileSelect}
            className="hidden"
            aria-label="File input"
          />
        </div>
      </div>
    </div>
  );
};
