"use client";

import React, { useState, useCallback } from "react";
import { Dialog, Transition, RadioGroup } from "@headlessui/react";
import {
  XMarkIcon,
  LinkIcon,
  CheckIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@sandworm/ui/lib/utils";
import { Share } from "@/components/Assets/Share";
import { TooltipV2 } from "./ToolTips";


type ShareVisibility = "WORKSPACE" | "LINK" | "PUBLIC";

type ShareModalProps = {
  link?: string;
  initialVisibility?: ShareVisibility;
  onVisibilityChange?: (
    visibility: ShareVisibility,
    meta?: { description?: string; tags?: string[] }
  ) => Promise<void> | void;
};

const visibilityOptions = [
  {
    id: "WORKSPACE" as const,
    name: "Workspace",
    description: "Only workspace members can access",
    icon: LockClosedIcon,
  },
  {
    id: "LINK" as const,
    name: "Anyone with link",
    description: "View-only with URL — not on explore",
    icon: LinkIcon,
  },
  {
    id: "PUBLIC" as const,
    name: "Publish to Community",
    description: "Appears on explore — anyone can view and fork",
    icon: GlobeAltIcon,
  },
];

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
    (tag: string) => onChange(tags.filter((t) => t !== tag)),
    [tags, onChange]
  );

  return (
    <div className="flex flex-wrap gap-1.5 rounded-lg border border-border-secondary bg-gray-50 dark:bg-base-100 px-3 py-2 min-h-[40px]">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-400"
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
      {tags.length < 5 && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
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
          className="flex-1 min-w-[80px] bg-transparent text-sm text-ink-100 dark:text-white outline-none placeholder:text-ink-400"
        />
      )}
    </div>
  );
}

export default function ShareModal({
  link = "https://app.sandworm.dev/notebooks/demo",
  initialVisibility = "WORKSPACE",
  onVisibilityChange,
}: ShareModalProps) {
  // state
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState<ShareVisibility>(initialVisibility);
  const [isUpdating, setIsUpdating] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // derived
  const showLink = visibility === "LINK" || visibility === "PUBLIC";
  const showMeta = visibility === "PUBLIC";

  // handlers
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [link]);

  const handleVisibilityChange = useCallback((newVisibility: ShareVisibility) => {
    setVisibility(newVisibility);
  }, []);

  const handleSave = useCallback(async () => {
    if (!onVisibilityChange) return;
    setIsUpdating(true);
    try {
      await onVisibilityChange(
        visibility,
        visibility === "PUBLIC" ? { description, tags } : undefined
      );
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update visibility:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [onVisibilityChange, visibility, description, tags]);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <>
      {/* ─── TRIGGER ─────────────────────────────────────────────────────── */}
      <TooltipV2 active title="Share" position="left">
        {(ref) => (
          <button
            ref={ref as React.RefObject<HTMLButtonElement>}
            type="button"
            onClick={openModal}
            className={cn(
              "p-2 mb-2 rounded-lg transition-colors flex items-center justify-center",
              "text-ink-400 hover:text-ink-100 dark:text-ink-100 dark:hover:text-white",
              "hover:bg-[#F1F3F4] dark:hover:bg-base-400"
            )}
            aria-label="Share"
          >
            <Share size={22} />
          </button>
        )}
      </TooltipV2>

      {/* ─── MODAL ───────────────────────────────────────────────────────── */}
      <Transition show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-[99]" onClose={closeModal}>

          {/* backdrop */}
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto font-body">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white dark:bg-base-400 shadow-xl transition-all px-3 py-4">

                  {/* header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-1">
                    <div>
                      <Dialog.Title className="text-lg font-medium text-ink-100 dark:text-white">
                        Share document
                      </Dialog.Title>
                      <p className="text-sm text-ink-300 dark:text-ink-400 mt-0.5">
                        Choose who can access this notebook
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-lg p-1.5 text-ink-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-base-500 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* ─── VISIBILITY OPTIONS ───────────────────────────── */}
                  <div className="px-5 py-4">
                    <RadioGroup
                      value={visibility}
                      onChange={handleVisibilityChange}
                      className="space-y-2"
                    >
                      {visibilityOptions.map((option) => (
                        <RadioGroup.Option
                          key={option.id}
                          value={option.id}
                          disabled={isUpdating}
                          className={({ checked }) =>
                            cn(
                              "relative flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-150",
                              checked
                                ? "border-none bg-primary-50 dark:bg-primary-500/10 ring-1 ring-primary"
                                : "border-border-secondary hover:border-gray-300 dark:hover:border-border-secondary hover:bg-gray-50 dark:hover:bg-base-500",
                              isUpdating && "opacity-50 cursor-not-allowed"
                            )
                          }
                        >
                          {({ checked }) => (
                            <>
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
                                  checked
                                    ? "bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400"
                                    : "bg-gray-100 dark:bg-base-500 text-ink-400 dark:text-ink-400"
                                )}
                              >
                                <option.icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <RadioGroup.Label
                                  as="p"
                                  className={cn(
                                    "text-sm font-medium transition-colors duration-150",
                                    checked
                                      ? "text-primary-900 dark:text-primary-300"
                                      : "text-ink-100"
                                  )}
                                >
                                  {option.name}
                                </RadioGroup.Label>
                                <RadioGroup.Description
                                  as="p"
                                  className={cn(
                                    "text-sm transition-colors duration-150",
                                    checked
                                      ? "text-primary-700 dark:text-primary-400"
                                      : "text-ink-400 dark:text-ink-400"
                                  )}
                                >
                                  {option.description}
                                </RadioGroup.Description>
                              </div>
                              <Transition
                                show={checked}
                                enter="transition-all duration-150 ease-out"
                                enterFrom="opacity-0 scale-75"
                                enterTo="opacity-100 scale-100"
                                leave="transition-all duration-100 ease-in"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-75"
                              >
                                <CheckIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0" />
                              </Transition>
                            </>
                          )}
                        </RadioGroup.Option>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* ─── COMMUNITY METADATA ──────────────────────────── */}
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
                      <div className="h-px bg-border-secondary" />
                      <div>
                        <label className="block text-xs font-medium text-ink-300 dark:text-ink-400 mb-1.5">
                          Description <span className="text-ink-400">(optional)</span>
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="What does this notebook analyse?"
                          rows={2}
                          maxLength={280}
                          className="w-full rounded-lg border border-border-secondary bg-gray-50 dark:bg-base-100 px-3 py-2 text-sm text-ink-100 dark:text-white placeholder:text-ink-400 outline-none resize-none focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-300 dark:text-ink-400 mb-1.5">
                          Tags <span className="text-ink-400">(up to 5 — press Enter or comma)</span>
                        </label>
                        <TagsInput tags={tags} onChange={setTags} />
                      </div>
                    </div>
                  </Transition>

                  {/* ─── COPY LINK ────────────────────────────────────── */}
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
                      <div className="flex items-center gap-2 rounded-lg border border-border-secondary bg-gray-50 dark:bg-base-100 p-1.5 pl-3">
                        <input
                          type="text"
                          readOnly
                          value={link}
                          className="flex-1 min-w-0 bg-transparent text-sm text-ink-400 dark:text-ink-400 outline-none truncate"
                        />
                        <button
                          type="button"
                          onClick={handleCopy}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150",
                            copied
                              ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                              : "bg-white dark:bg-base-100 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-base-500 border border-border-secondary"
                          )}
                        >
                          {copied ? (
                            <>
                              <CheckIcon className="h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <LinkIcon className="h-4 w-4" />
                              Copy link
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Transition>

                  {/* ─── FOOTER ──────────────────────────────────────── */}
                  <div className="px-5 pb-5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-ink-300 dark:text-ink-400 hover:text-ink-100 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isUpdating}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                        "bg-primary text-white hover:bg-primary/90",
                        isUpdating && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isUpdating ? "Saving..." : "Save"}
                    </button>
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}