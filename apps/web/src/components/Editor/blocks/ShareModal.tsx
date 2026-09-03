"use client";

import React, { useState, useCallback, useEffect } from "react";
import { DialogPanel, DialogTitle, Dialog, Transition, TransitionChild, RadioGroup } from "@headlessui/react";
import {
  PiX,
  PiLink,
  PiCheck,
  PiLockSimple,
  PiGlobe,
  PiCheckCircle,
  PiShareNetwork,
  PiFilePdf,
  PiSpinner,
} from "react-icons/pi";
import { cn } from "@sandworm/ui/lib/utils";

import { CloseIconButton } from "@/components/CloseIconButton";
import { tintPillDarkClassName } from "@/styles/interactive";

import { TooltipV2 } from "./ToolTips";

// =====================================
// ⬢ Types
// =====================================

type ShareVisibility = "WORKSPACE" | "LINK" | "PUBLIC";

type ShareModalProps = {
  link?: string;
  initialVisibility?: ShareVisibility;
  onVisibilityChange?: (
    visibility: ShareVisibility,
    meta?: { description?: string; tags?: string[] }
  ) => Promise<void> | void;
  onExportPDF?: () => void;
  isExportingPDF?: boolean;
  // Optional external control — lets another button (e.g. a top-bar
  // "Publish" action) open this same modal. Falls back to its own
  // internal state when omitted, so the existing icon trigger keeps
  // working unchanged.
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

// =====================================
// ⬢ Visibility Options
// =====================================

const visibilityOptions = [
  {
    id: "WORKSPACE" as const,
    name: "Workspace only",
    description: "Only workspace members can access",
    icon: PiLockSimple,
  },
  {
    id: "LINK" as const,
    name: "Anyone with link",
    description: "View-only with URL — not on explore",
    icon: PiLink,
  },
  {
    id: "PUBLIC" as const,
    name: "Publish to community",
    description: "Appears on explore — anyone can view and fork",
    icon: PiGlobe,
  },
];

// =====================================
// ⬢ Tags Input
// =====================================

function TagsInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = useCallback(
    (value: string) => {
      const tag = value.trim().toLowerCase().replace(/\s+/g, "-");
      if (tag && !tags.includes(tag) && tags.length < 5) {
        onChange([...tags, tag]);
      }
      setInput("");
    },
    [tags, onChange]
  );

  const removeTag = useCallback(
    (tag: string) => onChange(tags.filter(t => t !== tag)),
    [tags, onChange]
  );

  return (
    <div
      className="flex flex-wrap gap-1.5
      rounded-xl border border-transparent
      bg-base-300 dark:bg-base-730
      hover:border-border dark:hover:border-border-tertiary
      focus-within:border-primary-200 dark:focus-within:border-border-focus
      px-3 py-2 min-h-[40px] transition-colors duration-100"
    >
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1
            rounded-md px-2 py-0.5 text-[11px] font-medium
            bg-[#F3E6FD] dark:bg-create-project-tint/[0.16]
            border border-primary-200 dark:border-border-tertiary
            text-primary-700 dark:text-white"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            <PiX size={10} />
          </button>
        </span>
      ))}
      {tags.length < 5 && (
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(input);
            }
            if (e.key === "Backspace" && !input && tags.length) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length === 0 ? "defi, ethereum, nft..." : ""}
          className="flex-1 min-w-[80px] bg-transparent text-sm
            text-ink-500 dark:text-ink-200
            placeholder:text-ink-300 dark:placeholder:text-placeholder-muted
            outline-none"
        />
      )}
    </div>
  );
}

// =====================================
// ⬢ ShareModal
// =====================================

export default function ShareModal({
  link = "https://app.sandworm.dev/notebooks/demo",
  initialVisibility = "WORKSPACE",
  onVisibilityChange,
  onExportPDF,
  isExportingPDF = false,
  isOpen: isOpenProp,
  onOpenChange,
}: ShareModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = isOpenProp !== undefined;
  const isOpen = isControlled ? isOpenProp : internalOpen;

  const setIsOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] =
    useState<ShareVisibility>(initialVisibility);
  const [isUpdating, setIsUpdating] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Reflect the document's real current state each time the modal opens —
  // it stays mounted between opens, so without this it would keep showing
  // whatever visibility was selected the first time it ever opened.
  useEffect(() => {
    if (isOpen) {
      setVisibility(initialVisibility);
    }
  }, [isOpen, initialVisibility]);

  const showLink = visibility === "LINK" || visibility === "PUBLIC";
  const showMeta = visibility === "PUBLIC";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [link]);

  const handleSave = useCallback(async () => {
    if (!onVisibilityChange) return;
    setIsUpdating(true);
    try {
      await onVisibilityChange(
        visibility,
        visibility === "PUBLIC" ? { description, tags } : undefined
      );
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to update visibility:", err);
    } finally {
      setIsUpdating(false);
    }
  }, [onVisibilityChange, visibility, description, tags, setIsOpen]);

  const openModal = useCallback(() => setIsOpen(true), [setIsOpen]);
  const closeModal = useCallback(() => setIsOpen(false), [setIsOpen]);

  const handleExportPDF = useCallback(() => {
    // Close the modal first, then trigger print after the leave animation
    // completes (leave transition is duration-150, so 200ms is safe).
    setIsOpen(false);
    setTimeout(() => onExportPDF?.(), 200);
  }, [onExportPDF, setIsOpen]);

  return (
    <>
      {/* ── Trigger ── */}
      <TooltipV2 active title="Share" position="left">
        {ref => (
          <button
            ref={ref as React.RefObject<HTMLButtonElement>}
            type="button"
            onClick={openModal}
            aria-label="Share"
            className="w-[30px] h-[30px] mx-auto mb-1.5 flex items-center justify-center rounded-[10px] border border-transparent text-ink-navy dark:text-ink-navy hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors duration-100"
          >
            <PiShareNetwork size={16} />
          </button>
        )}
      </TooltipV2>

      {/* ── Modal ── */}
      <Transition show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
          {/* Backdrop */}
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/10 dark:bg-black/30" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto font-body">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={React.Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95 translate-y-2"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-1"
              >
                <DialogPanel
                  className="w-full max-w-md rounded-2xl overflow-hidden
                  bg-white dark:bg-dropdown-bg
                  border border-base-300 dark:border-border-tertiary
                  shadow-xl"
                >
                  {/* ── Header ── */}
                  <div
                    className="flex items-start justify-between px-5 pt-5 pb-4
                    border-b border-base-300 dark:border-border-tertiary"
                  >
                    <div>
                      <DialogTitle className="text-base font-medium text-ink-100 dark:text-white">
                        Share notebook
                      </DialogTitle>
                      <p className="text-[12.5px] text-ink-400 dark:text-placeholder-muted mt-0.5">
                        Choose who can access this notebook
                      </p>
                    </div>
                    <CloseIconButton onClick={closeModal} />
                  </div>

                  {/* ── Visibility options ── */}
                  <div className="px-5 py-4">
                    <RadioGroup
                      value={visibility}
                      onChange={setVisibility}
                      className="flex flex-col gap-2"
                    >
                      {visibilityOptions.map(option => (
                        <RadioGroup.Option
                          key={option.id}
                          value={option.id}
                          disabled={isUpdating}
                          className={({ checked }) =>
                            cn(
                              "relative flex items-center gap-3 rounded-xl px-4 py-3",
                              "cursor-pointer transition-all duration-150 border",
                              checked
                                ? "border-hover-border bg-hover-bg dark:bg-base-600 dark:text-ink-100 dark:border-border-tertiary"
                                : "border-border dark:border-border-tertiary hover:bg-hover-bg hover:border-primary dark:hover:bg-dropdown-hover",
                              isUpdating && "opacity-50 cursor-not-allowed"
                            )
                          }
                        >
                          {({ checked }) => (
                            <>
                              {/* Icon badge */}
                              <div
                                className={cn(
                                  "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-colors",
                                  checked
                                    ? "bg-[#E8D5FC] dark:bg-create-project-tint/[0.16] text-primary-700 dark:text-white"
                                    : "bg-base-300 dark:bg-base-700 text-ink-400 dark:text-placeholder-muted"
                                )}
                              >
                                <option.icon size={16} />
                              </div>

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <RadioGroup.Label
                                  as="p"
                                  className={cn(
                                    "text-sm font-medium leading-tight",
                                    checked
                                      ? "text-primary-700 dark:text-white"
                                      : "text-ink-500 dark:text-ink-200"
                                  )}
                                >
                                  {option.name}
                                </RadioGroup.Label>
                                <RadioGroup.Description
                                  as="p"
                                  className="text-[12px] text-ink-300 dark:text-placeholder-muted mt-0.5"
                                >
                                  {option.description}
                                </RadioGroup.Description>
                              </div>

                              {/* Check */}
                              <Transition
                                show={checked}
                                enter="transition-all duration-150 ease-out"
                                enterFrom="opacity-0 scale-75"
                                enterTo="opacity-100 scale-100"
                                leave="transition-all duration-100 ease-in"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-75"
                              >
                                <PiCheckCircle
                                  size={18}
                                  className="text-primary dark:text-white flex-shrink-0"
                                />
                              </Transition>
                            </>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* ── Community metadata ── */}
                  <Transition
                    show={showMeta}
                    enter="transition-all duration-200 ease-out"
                    enterFrom="opacity-0 -translate-y-2 max-h-0"
                    enterTo="opacity-100 translate-y-0 max-h-96"
                    leave="transition-all duration-150 ease-in"
                    leaveFrom="opacity-100 translate-y-0 max-h-96"
                    leaveTo="opacity-0 -translate-y-2 max-h-0"
                  >
                    <div className="px-5 pb-4 space-y-3 overflow-hidden">
                      <div className="h-px bg-base-300 dark:bg-base-700" />
                      <div>
                        <label
                          className="block text-[11px] font-semibold
                          text-ink-300 dark:text-placeholder-muted
                          uppercase tracking-wider mb-1.5"
                        >
                          Description{" "}
                          <span className="normal-case font-normal tracking-normal text-ink-300">
                            (optional)
                          </span>
                        </label>
                        <textarea
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder="What does this notebook analyse?"
                          rows={2}
                          maxLength={280}
                          className="w-full rounded-xl text-sm
                            text-ink-500 dark:text-ink-200
                            placeholder:text-ink-300 dark:placeholder:text-placeholder-muted
                            bg-base-300 dark:bg-base-730
                            border border-transparent
                            hover:border-border dark:hover:border-border-tertiary
                            focus:border-primary-200 dark:focus:border-border-focus
                            px-3 py-2 resize-none outline-none
                            transition-colors duration-100"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-[11px] font-semibold
                          text-ink-300 dark:text-placeholder-muted
                          uppercase tracking-wider mb-1.5"
                        >
                          Tags{" "}
                          <span className="normal-case font-normal tracking-normal text-ink-300">
                            (up to 5 — Enter or comma)
                          </span>
                        </label>
                        <TagsInput tags={tags} onChange={setTags} />
                      </div>
                    </div>
                  </Transition>

                  {/* ── Copy link ── */}
                  <Transition
                    show={showLink}
                    enter="transition-all duration-200 ease-out"
                    enterFrom="opacity-0 -translate-y-1 max-h-0"
                    enterTo="opacity-100 translate-y-0 max-h-24"
                    leave="transition-all duration-150 ease-in"
                    leaveFrom="opacity-100 translate-y-0 max-h-24"
                    leaveTo="opacity-0 -translate-y-1 max-h-0"
                  >
                    <div className="px-5 pb-4 overflow-hidden">
                      <div
                        className="flex items-center gap-2
                        rounded-xl border border-border dark:border-border-tertiary
                        bg-base-300 dark:bg-base-730
                        p-1.5 pl-3"
                      >
                        <input
                          type="text"
                          readOnly
                          value={link}
                          className="flex-1 min-w-0 bg-transparent text-sm
                            text-ink-400 dark:text-placeholder-muted outline-none truncate"
                        />
                        <button
                          type="button"
                          onClick={handleCopy}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150",
                            copied
                              ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900"
                              : "bg-white dark:bg-base-720 text-ink-500 dark:text-ink-200 border border-border dark:border-border-tertiary hover:bg-primary-tint-50 dark:hover:bg-dropdown-hover hover:border-primary-200 dark:hover:border-border-tertiary"
                          )}
                        >
                          {copied ? (
                            <>
                              <PiCheck size={14} />
                              Copied
                            </>
                          ) : (
                            <>
                              <PiLink size={14} />
                              Copy link
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Transition>

                  {onExportPDF && (
                    <div className="px-5 pb-4">
                      <div className="h-px bg-base-300 dark:bg-base-700 mb-4" />
                      <button
                        type="button"
                        onClick={handleExportPDF}
                        disabled={isExportingPDF}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 border",
                          isExportingPDF
                            ? "border-border dark:border-border-tertiary bg-inputBg dark:bg-base-730 text-ink-300 dark:text-placeholder-muted cursor-not-allowed"
                            : "border-border dark:border-border-tertiary hover:bg-primary-tint-50 dark:hover:bg-dropdown-hover hover:border-primary-200 dark:hover:border-border-tertiary text-ink-500 dark:text-ink-200"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0",
                            isExportingPDF
                              ? "bg-base-300 dark:bg-base-700 text-ink-300 dark:text-placeholder-muted"
                              : "bg-base-300 dark:bg-base-700 text-ink-400 dark:text-placeholder-muted"
                          )}
                        >
                          {isExportingPDF ? (
                            <PiSpinner size={16} className="animate-spin" />
                          ) : (
                            <PiFilePdf size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium leading-tight">
                            {isExportingPDF
                              ? "Preparing PDF…"
                              : "Download as PDF"}
                          </p>
                          <p className="text-[12px] text-ink-300 dark:text-placeholder-muted mt-0.5">
                            Export this notebook as a printable PDF
                          </p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* ── Footer ── */}
                  <div
                    className="flex items-center justify-end gap-2 px-5 py-4
                    border-t border-base-300 dark:border-border-tertiary"
                  >
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-sm font-medium px-6 py-1.5 rounded-xl
                        text-ink-400 dark:text-placeholder-muted
                        border border-border dark:border-border-tertiary
                        bg-inputBg dark:bg-transparent
                        hover:bg-base-300 dark:hover:bg-dropdown-hover
                        hover:text-ink-500 dark:hover:text-ink-300
                        transition-colors duration-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isUpdating}
                      className={cn(
                        "flex items-center gap-1.5 px-6 py-1.5 rounded-xl text-sm font-medium transition-all duration-100",
                        isUpdating
                          ? "bg-base-300 dark:bg-base-700 text-ink-300 dark:text-placeholder-muted cursor-not-allowed"
                          : `bg-primary hover:bg-primary-710 text-white active:scale-[0.98] ${tintPillDarkClassName}`
                      )}
                    >
                      {isUpdating && (
                        <PiSpinner size={14} className="animate-spin" />
                      )}
                      {isUpdating ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
