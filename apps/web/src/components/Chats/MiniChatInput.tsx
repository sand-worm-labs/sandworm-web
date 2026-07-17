import type { ChangeEvent, KeyboardEvent } from "react";
import React, { useState, useRef, useCallback } from "react";
import {
  PiPlus,
  PiPaperPlaneTilt,
  PiX,
  PiFileCsv,
  PiFileText,
  PiSpinner,
  PiStop,
} from "react-icons/pi";

import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";
import { ModelQuickSelect } from "@/components/Editor/blocks/ModelQuickSelect";
import { ModelPickerModal } from "@/components/Editor/blocks/ModelPicker";
import type { NormalizedModel } from "@/components/Editor/hooks/useOpenRouterModel";

import { AddMenu } from "./AddMenu";
import {
  InputReferencePill,
  PILL_BASE,
  PILL_TEXT_CLASS,
  PILL_CANCEL_CLASS,
} from "./ReferencePill";
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
  onAbort?: () => void;
  placeholder?: string;
  maxHeight?: number;
  acceptedFileTypes?: string;
  disabled: boolean;
  isGenerating?: boolean;
  referenceSources?: ReferenceSource[];
  pendingReview?: PendingReviewPart;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  models?: NormalizedModel[];
  modelsLoading?: boolean;
  modelsError?: Error;
  selectedModelId?: string | null;
  onSelectModel?: (modelId: string) => void;
  isModelPickerOpen?: boolean;
  onOpenModelPicker?: () => void;
  onCloseModelPicker?: () => void;
}

// =====================================
// ⬢ Helpers
// =====================================

let _localIdCounter = 0;
function genLocalId() {
  _localIdCounter += 1;
  return `tracked-file-${_localIdCounter}`;
}

// =====================================
// ⬢ File Icon
// =====================================

function FileIcon({ file }: { file: File }) {
  if (file.type.includes("csv") || file.type.includes("spreadsheet")) {
    return <PiFileCsv size={12} />;
  }
  return <PiFileText size={12} />;
}

// =====================================
// ⬢ File Status Indicator
// =====================================

function FileStatusIndicator({ status }: { status: TrackedFile["status"] }) {
  if (status === "uploading") {
    return (
      <span className="text-primary animate-spin">
        <PiSpinner size={12} />
      </span>
    );
  }
  return null;
}

// =====================================
// ⬢ File Pill
// =====================================

function FilePill({
  tracked,
  onRemove,
}: {
  tracked: TrackedFile;
  onRemove: (localId: string) => void;
}) {
  const isError = tracked.status === "error";
  return (
    <div
      className={`${PILL_BASE} ${
        isError ? "text-error" : PILL_TEXT_CLASS
      } text-[11px] pl-1.5 pr-1 py-[2.5px] transition-colors`}
    >
      <span className={isError ? "text-error" : "text-primary"}>
        <FileIcon file={tracked.file} />
      </span>
      <span className="max-w-[140px] truncate">{tracked.file.name}</span>
      <FileStatusIndicator status={tracked.status} />
      <button
        type="button"
        onClick={() => onRemove(tracked.localId)}
        aria-label="Remove file"
        className={PILL_CANCEL_CLASS}
      >
        <PiX size={10} />
      </button>
    </div>
  );
}

// =====================================
// ⬢ Pill Strip
// =====================================

interface PillStripProps {
  references: AttachedReference[];
  onRemoveReference: (id: string) => void;
  trackedFiles: TrackedFile[];
  onRemoveFile: (localId: string) => void;
}

function PillStrip({
  references,
  onRemoveReference,
  trackedFiles,
  onRemoveFile,
}: PillStripProps) {
  if (references.length === 0 && trackedFiles.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 px-3 pt-2.5 pb-0">
      {trackedFiles.map(tracked => (
        <FilePill
          key={tracked.localId}
          tracked={tracked}
          onRemove={onRemoveFile}
        />
      ))}
      {references.map(ref => (
        <InputReferencePill
          key={ref.id}
          reference={ref}
          onRemove={onRemoveReference}
        />
      ))}
    </div>
  );
}

// =====================================
// ⬢ Abort Button
// =====================================

function AbortButton({ onAbort }: { onAbort?: () => void }) {
  return (
    <div className="relative w-8 h-8 flex-shrink-0">
      <div
        className="absolute inset-0 rounded-xl animate-spin"
        style={{
          background:
            "conic-gradient(#A308F0 0deg 90deg, transparent 90deg 360deg)",
        }}
      />
      <button
        type="button"
        onClick={onAbort}
        aria-label="Stop generation"
        className="absolute inset-[2px] rounded-[10px] flex items-center justify-center
          bg-base-200 dark:bg-base-200"
      >
        <PiStop size={14} className="text-ink-navy dark:text-ink-300" />
      </button>
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
  onAbort,
  placeholder = "Ask a question or run an analysis...",
  maxHeight = 200,
  acceptedFileTypes = ".csv,.pdf,.doc,.docx,.txt,.xls,.xlsx,.md",
  disabled,
  isGenerating = false,
  referenceSources = DEFAULT_SOURCES,
  pendingReview,
  onAcceptAll,
  onRejectAll,
  models = [],
  modelsLoading = false,
  modelsError,
  selectedModelId = null,
  onSelectModel,
  isModelPickerOpen = false,
  onOpenModelPicker,
  onCloseModelPicker,
}) => {
  // =====================================
  // ⬢ State
  // =====================================

  const [message, setMessage] = useState("");
  const [trackedFiles, setTrackedFiles] = useState<TrackedFile[]>([]);
  const [references, setReferences] = useState<AttachedReference[]>([]);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // =====================================
  // ⬢ Derived
  // =====================================

  const selectedIds = new Set(references.map(r => r.id));
  const isUploading = trackedFiles.some(f => f.status === "uploading");
  const isLocked = disabled || isGenerating;
  const canSend =
    (message.trim().length > 0 || trackedFiles.length > 0) &&
    !isLocked &&
    !isUploading;
  const hasReferencableItems = referenceSources.some(s => s.items.length > 0);

  // =====================================
  // ⬢ Reference Handlers
  // =====================================

  const handleReferenceSelect = useCallback((ref: AttachedReference) => {
    setReferences(prev =>
      prev.some(r => r.id === ref.id) ? prev : [...prev, ref]
    );
    setAddMenuOpen(false);
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

      e.target.value = "";
    },
    [onUploadFile, uploadTrackedFile]
  );

  const removeTrackedFile = useCallback((localId: string) => {
    setTrackedFiles(prev => prev.filter(f => f.localId !== localId));
  }, []);

  const handleAddFilesClick = useCallback(() => {
    setAddMenuOpen(false);
    fileInputRef.current?.click();
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
    if (addMenuOpen && e.key === "Escape") {
      e.preventDefault();
      setAddMenuOpen(false);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !addMenuOpen) {
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
      {addMenuOpen && (
        <AddMenu
          sources={referenceSources}
          selectedIds={selectedIds}
          hasReferencableItems={hasReferencableItems}
          onSelectReference={handleReferenceSelect}
          onAddFiles={handleAddFilesClick}
          onClose={() => setAddMenuOpen(false)}
        />
      )}

      <div className="bg-base-100 dark:bg-base-740 border border-border-secondary dark:border-border-tertiary rounded-2xl shadow-sm">
        {pendingChanges && pendingChanges.length > 0 && (
          <div className="px-0 pt-0 border-b border-border dark:border-border-tertiary">
            <ChangesPanelCompact
              changes={pendingChanges}
              onConfirm={onAcceptAll}
              onUndo={onRejectAll}
            />
          </div>
        )}

        <PillStrip
          references={references}
          onRemoveReference={handleReferenceRemove}
          trackedFiles={trackedFiles}
          onRemoveFile={removeTrackedFile}
        />

        <div className="px-1.5 pt-1.5 pb-1.5">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLocked}
            rows={2}
            aria-label="Message input"
            className="w-full resize-none bg-transparent outline-none
              text-ink-100 dark:text-white text-sm
              placeholder:text-ink-300 dark:placeholder:text-ink-400
              pt-1.5 px-3 max-h-[300px]
              disabled:opacity-95"
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1.5">
            <TooltipV2<HTMLButtonElement> title="Add" active position="top">
              {ref => (
                <button
                  ref={ref}
                  type="button"
                  onClick={() => setAddMenuOpen(o => !o)}
                  disabled={isLocked}
                  aria-label="Add to message"
                  aria-expanded={addMenuOpen}
                  className={`flex items-center justify-center w-[26px] h-[26px] rounded-full
                    border transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                    ${
                      addMenuOpen || references.length > 0
                        ? "bg-[#F3E6FD] border-primary-300 text-primary-700 dark:bg-primary-920 dark:border-primary-700 dark:text-primary-300"
                        : "bg-white dark:bg-base-740 border-border-cool dark:border-transparent text-ink-400 dark:text-ink-500 hover:bg-gray-50 dark:hover:bg-base-710"
                    }`}
                >
                  <PiPlus
                    size={13}
                    className={`transition-transform duration-150 ${addMenuOpen ? "rotate-45" : ""}`}
                  />
                </button>
              )}
            </TooltipV2>
          </div>

          <div className="flex items-center gap-2">
            {onSelectModel && onOpenModelPicker && onCloseModelPicker && (
              <ModelQuickSelect
                models={models}
                showBrowseAll={false}
                selectedModelId={selectedModelId}
                onSelect={onSelectModel}
                onBrowseAll={onOpenModelPicker}
                variant="compact"
                dropdownPosition="top"
                dropdownAlign="right"
              />
            )}

            {/* ─── Abort / Send ─── */}
            {isGenerating ? (
              <AbortButton onAbort={onAbort} />
            ) : (
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
                    className={`flex items-center justify-center w-[26px] h-[26px] rounded-full transition-colors
                    ${
                      canSend
                        ? "bg-primary hover:bg-primary-710 text-white"
                        : "bg-white dark:bg-base-740 text-ink-400 cursor-not-allowed border border-border dark:border-border-tertiary"
                    }`}
                  >
                    {isUploading ? (
                      <PiSpinner size={13} className="animate-spin" />
                    ) : (
                      <PiPaperPlaneTilt size={13} />
                    )}
                  </button>
                )}
              </TooltipV2>
            )}
          </div>

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

      {onSelectModel && onCloseModelPicker && (
        <ModelPickerModal
          isOpen={isModelPickerOpen}
          onClose={onCloseModelPicker}
          onSelect={onSelectModel}
          models={models}
          loading={modelsLoading}
          error={modelsError}
          selectedModelId={selectedModelId}
          title="Select Model"
        />
      )}
    </div>
  );
};
