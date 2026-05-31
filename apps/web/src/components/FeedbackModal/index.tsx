"use client";

import { useState, useRef, Fragment, useCallback } from "react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import {
  PiCheck,
  PiX,
  PiCaretDown,
  PiArrowRight,
  PiUploadSimple,
  PiFile,
} from "react-icons/pi";

import Spin from "@/components/Editor/blocks/Spin";
import { BoltIcon as PowerToolBoxIcon } from "@/components/Assets/BoltIcon";

// =====================================
// ⬢ Types
// =====================================

type ReportType = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

// =====================================
// ⬢ Report Types
// =====================================

const REPORT_TYPES: ReportType[] = [
  {
    id: "bug",
    label: "Bug",
    description: "Something isn't working as expected",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2a2.5 2.5 0 0 1 2.5 2.5V6H5.5V4.5A2.5 2.5 0 0 1 8 2Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <rect
          x="3.5"
          y="6"
          width="9"
          height="7"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M1.5 7.5H3.5M12.5 7.5H14.5M1.5 11H3.5M12.5 11H14.5M6 14.5v1M10 14.5v1"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "data-inaccuracy",
    label: "Data Inaccuracy",
    description: "Information shown is incorrect or misleading",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M8 5v3.5M8 11v.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "feature-request",
    label: "Feature Request",
    description: "Propose a new feature or improvement",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "performance",
    label: "Performance Issue",
    description: "The app feels slow or unresponsive",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 12L6 8l2.5 2.5L14 5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="5" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "general-feedback",
    label: "General Feedback",
    description: "Share your thoughts or suggestions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6A1.5 1.5 0 0 1 12.5 11H9l-3 3v-3H3.5A1.5 1.5 0 0 1 2 9.5v-6Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const MAX_FILES = 5;
const MAX_CHARS = 1000;

// =====================================
// ⬢ Label
// =====================================
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold text-ink-300 dark:text-ink-600 uppercase  mb-2">
      {children}
    </label>
  );
}

// =====================================
// ⬢ FeedbackModal
// =====================================
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [feedback, setFeedback] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charsLeft = MAX_CHARS - feedback.length;
  const canSubmit = selectedType !== null && feedback.trim().length > 0;

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    setFiles(prev => [...prev, ...Array.from(incoming)].slice(0, MAX_FILES));
  }

  function removeFile(index: number) {
    setFiles(f => f.filter((_, i) => i !== index));
  }

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setSelectedType(null);
      setFeedback("");
      setFiles([]);
      setSubmitted(false);
    }, 300);
  }, [onClose]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await new Promise(r => {
      setTimeout(r, 1200);
    });
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(handleClose, 2000);
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-[99]">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0000001A] dark:bg-black/30" />
        </Transition.Child>

        {/* ── Panel ── */}
        <div className="fixed inset-0 flex items-center justify-center p-4 font-body">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-1"
          >
            <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-base-100 rounded-2xl overflow-hidden border border-border-secondary dark:border-[#2A2A28] ">
              {submitted ? (
                <SuccessState />
              ) : (
                <div className="flex flex-col max-h-[90vh]">
                  <div className="flex items-start justify-between px-6 pt-6 pb-2">
                    <div>
                      <Dialog.Title className="text-lg font-medium text-ink-100 dark:text-white flex gap-x-2">
                        <PowerToolBoxIcon />
                        <span> Share feedback</span>
                      </Dialog.Title>
                      <p className="text-[12.5px] font-medium text-ink-400 dark:text-ink-500 mt-1">
                        We'd love to hear your thoughts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      aria-label="Close"
                      className="flex items-center justify-center w-7 h-7 rounded-lg
                        text-ink-400 hover:text-ink-500
                        hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
                        transition-colors"
                    >
                      <PiX size={15} />
                    </button>
                  </div>

                  <div className="overflow-y-auto px-6 py-5 flex-1 space-y-5">
                    <div>
                      <FieldLabel>Feedback type</FieldLabel>
                      <Listbox value={selectedType} onChange={setSelectedType}>
                        <div className="relative">
                          <Listbox.Button
                            className="w-full flex items-center justify-between
                            px-3.5 py-2.5 rounded-xl text-[13px] text-left
                            bg-[#F1F3F4] dark:bg-[#1C1C1A]
                            border border-transparent
                            focus:outline-none focus:border-[#D9A8F8] dark:focus:border-[#7A06B8]
                            hover:border-[#DEE2E6] dark:hover:border-[#3A3A38]
                            transition-colors duration-100"
                          >
                            {selectedType ? (
                              <span className="flex items-center gap-2.5 text-ink-500 dark:text-ink-200">
                                <span className="text-ink-400 dark:text-ink-500">
                                  {selectedType.icon}
                                </span>
                                {selectedType.label}
                              </span>
                            ) : (
                              <span className="text-ink-300 dark:text-ink-600">
                                Select feedback type…
                              </span>
                            )}
                            <PiCaretDown
                              size={13}
                              className="text-ink-300 dark:text-ink-600 shrink-0"
                            />
                          </Listbox.Button>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="opacity-0 scale-95 -translate-y-1"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="transition ease-in duration-75"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-1"
                          >
                            <Listbox.Options
                              className="absolute z-10 mt-1.5 w-full
                              bg-white dark:bg-[#1C1C1A]
                              border border-[#E8E8E6] dark:border-[#2E2E2C]
                              rounded-2xl shadow-sm
                              overflow-hidden focus:outline-none p-1"
                            >
                              {REPORT_TYPES.map(type => (
                                <Listbox.Option
                                  key={type.id}
                                  value={type}
                                  as={Fragment}
                                >
                                  {({ active, selected }) => (
                                    <li
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                                      ${active ? "bg-primary/10 dark:bg-primary/10" : ""}`}
                                    >
                                      <span
                                        className={
                                          selected
                                            ? "text-[#A308F0]"
                                            : "text-ink-400 dark:text-ink-500"
                                        }
                                      >
                                        {type.icon}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p
                                          className={`text-[13px] font-medium ${
                                            selected
                                              ? "text-[#A308F0]"
                                              : "text-ink-500 dark:text-ink-200"
                                          }`}
                                        >
                                          {type.label}
                                        </p>
                                        <p className="text-[11px] text-ink-300 dark:text-ink-600 truncate">
                                          {type.description}
                                        </p>
                                      </div>
                                      {selected && (
                                        <PiCheck
                                          size={14}
                                          className="text-[#A308F0] ml-auto shrink-0"
                                        />
                                      )}
                                    </li>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </Listbox>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <FieldLabel>Description</FieldLabel>
                        <span
                          className={`text-[11px] tabular-nums ${
                            charsLeft < 100
                              ? "text-amber-500"
                              : "text-ink-300 dark:text-ink-600"
                          }`}
                        >
                          {charsLeft} left
                        </span>
                      </div>
                      <textarea
                        value={feedback}
                        onChange={e =>
                          setFeedback(e.target.value.slice(0, MAX_CHARS))
                        }
                        placeholder="Describe in detail. What did you expect? What happened instead?"
                        rows={4}
                        className="w-full text-[13px] text-ink-500 dark:text-ink-200
                          placeholder:text-ink-300 dark:placeholder:text-ink-600
                          bg-[#F1F3F4] dark:bg-[#1C1C1A]
                          border border-transparent
                          focus:border-[#D9A8F8] dark:focus:border-[#7A06B8]
                          hover:border-[#DEE2E6] dark:hover:border-[#3A3A38]
                          rounded-xl px-3.5 py-3 resize-none
                          focus:outline-none transition-colors duration-100"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <FieldLabel>Attachments</FieldLabel>
                        <span className="text-[11px] text-ink-300 dark:text-ink-600">
                          {files.length}/{MAX_FILES}
                        </span>
                      </div>

                      {files.length < MAX_FILES && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              fileInputRef.current?.click();
                            }
                          }}
                          onDragOver={e => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={e => {
                            e.preventDefault();
                            setIsDragging(false);
                            handleFiles(e.dataTransfer.files);
                          }}
                          className={`flex flex-col items-center justify-center gap-2
                            border-2 border-dashed rounded-xl py-6
                            transition-colors duration-150
                            bg-transparent w-full
                            ${
                              isDragging
                                ? "border-[#A308F0] bg-primary/5 dark:bg-primary/10"
                                : "border-[#DEE2E6] dark:border-[#3A3A38] hover:border-[#C97FF5] dark:hover:border-[#7A06B8] hover:bg-primary/[0.02]"
                            }`}
                        >
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg
                            bg-[#F1F3F4] dark:bg-[#2A2A28]
                            text-ink-300 dark:text-ink-500"
                          >
                            <PiUploadSimple size={15} />
                          </div>
                          <div className="text-center">
                            <p className="text-[12.5px] font-medium text-ink-500 dark:text-ink-300">
                              Drop files or{" "}
                              <span className="text-accent underline underline-offset-2">
                                browse
                              </span>
                            </p>
                            <p className="text-[11px] text-ink-300 dark:text-ink-600 mt-0.5">
                              PNG, JPG, PDF · up to 10MB each
                            </p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={e => handleFiles(e.target.files)}
                          />
                        </button>
                      )}

                      {files.length > 0 && (
                        <ul className="mt-2 flex flex-col gap-1.5">
                          {files.map((file, i) => (
                            <li
                              key={`${file.name}-${file.size}-${file.lastModified}`}
                              className="flex items-center gap-2.5 px-3 py-2
                              bg-[#F9F5FF] dark:bg-[#1A0D26]
                              border border-[#E8D5FC] dark:border-[#2E1A40]
                              rounded-lg"
                            >
                              <PiFile
                                size={13}
                                className="text-ink-400 dark:text-ink-500 shrink-0"
                              />
                              <span className="text-[12px] text-ink-500 dark:text-ink-300 truncate flex-1">
                                {file.name}
                              </span>
                              <span className="text-[11px] text-ink-300 dark:text-ink-600 shrink-0 tabular-nums">
                                {(file.size / 1024).toFixed(0)}KB
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFile(i)}
                                aria-label="Remove file"
                                className="shrink-0 text-ink-300 hover:text-[#D85A30] transition-colors"
                              >
                                <PiX size={13} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between px-6 py-4
                    border-t border-[#F1F3F4] dark:border-[#2A2A28]"
                  >
                    <button
                      type="button"
                      onClick={handleClose}
                      className="text-sm font-medium
                        text-ink-400 dark:text-ink-500
                        border border-[#DEE2E6] dark:border-[#3A3A38]
                        px-6 py-1.5 rounded-xl
                        hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
                        hover:text-ink-500 dark:hover:text-ink-300
                        transition-colors duration-100 bg-[#F8F9FA]"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSubmitting}
                      className={`flex items-center gap-2 px-6 py-1.5 rounded-xl text-sm font-medium
                        transition-all duration-100 active:scale-[0.98]
                        ${
                          canSubmit && !isSubmitting
                            ? "bg-[#A308F0] hover:bg-[#8A06CC] text-white"
                            : "bg-[#868E96] dark:bg-[#2A2A28] text-white dark:text-ink-600 cursor-not-allowed"
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Spin />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send feedback
                          <PiArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

// =====================================
// ⬢ Success State
// =====================================

function SuccessState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-full
        bg-green-50 dark:bg-green-950/30
        border border-green-100 dark:border-green-900
        mb-4"
      >
        <PiCheck size={20} className="text-green-500" />
      </div>
      <p className="text-[15px] font-semibold text-ink-100 dark:text-white">
        Feedback received
      </p>
      <p className="text-[13px] text-ink-400 dark:text-ink-500 mt-1">
        Thanks for sharing — we really appreciate it.
      </p>
    </div>
  );
}
