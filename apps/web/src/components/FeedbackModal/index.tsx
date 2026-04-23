"use client";

import { useState, useRef } from "react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import { Fragment } from "react";

type ReportType = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const REPORT_TYPES: ReportType[] = [
  {
    id: "bug",
    label: "Bug",
    description: "Something isn't working as expected",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2a2.5 2.5 0 0 1 2.5 2.5V6H5.5V4.5A2.5 2.5 0 0 1 8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        <rect x="3.5" y="6" width="9" height="7" rx="2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M1.5 7.5H3.5M12.5 7.5H14.5M1.5 11H3.5M12.5 11H14.5M6 14.5v1M10 14.5v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "data-inaccuracy",
    label: "Data Inaccuracy",
    description: "Information shown is incorrect or misleading",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "feature-request",
    label: "Feature Request / Suggestion",
    description: "Propose a new feature or improvement",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    id: "performance",
    label: "Performance Issue",
    description: "The app feels slow or unresponsive",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L6 8l2.5 2.5L14 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="5" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "general-feedback",
    label: "General Feedback",
    description: "Share your thoughts or suggestions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6A1.5 1.5 0 0 1 12.5 11H9l-3 3v-3H3.5A1.5 1.5 0 0 1 2 9.5v-6Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const MAX_FILES = 5;
const MAX_CHARS = 1000;

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
  const canSubmit = selectedType && feedback.trim().length > 0;

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next = [...files, ...Array.from(incoming)].slice(0, MAX_FILES);
    setFiles(next);
  }

  function removeFile(index: number) {
    setFiles((f) => f.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 2000);
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      setSelectedType(null);
      setFeedback("");
      setFiles([]);
      setSubmitted(false);
    }, 300);
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0000001A]" />
        </Transition.Child>

        {/* Modal */}
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
            <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl  overflow-hidden">
              {submitted ? (
                <SuccessState />
              ) : (
                <div className="flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="flex items-start justify-between px-6 pt-6 pb-4">
                    <div>
                      <Dialog.Title className="text-[15px] font-semibold text-gray-900 tracking-tight">
                        Share feedback
                      </Dialog.Title>
                      <p className="text-[13px] text-ink-400 mt-0.5">
                        We'd love to hear your thoughts.
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-0.5 -mr-1"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  <div className="overflow-y-auto px-6 pb-6 flex-1 space-y-5">
                    {/* Report type */}
                    <div>
                      <label className="block text-[12px] font-medium text-ink-100 uppercase tracking-wide mb-2">
                        Feedback type
                      </label>
                      <Listbox value={selectedType} onChange={setSelectedType}>
                        <div className="relative">
                          <Listbox.Button className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-border-secondary bg-white text-[13px] text-left transition-colors hover:border-border-secondary focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400">
                            {selectedType ? (
                              <span className="flex items-center gap-2.5 text-gray-800">
                                <span className="text-ink-100">{selectedType.icon}</span>
                                {selectedType.label}
                              </span>
                            ) : (
                              <span className="text-ink-400">Select feedback type…</span>
                            )}
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink-400 shrink-0">
                              <path d="M2.5 5L7 9.5 11.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
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
                            <Listbox.Options className="absolute z-10 mt-1.5 w-full bg-white border border-border-secondary rounded-xl shadow-lg shadow-gray-900/5 overflow-hidden focus:outline-none">
                              {REPORT_TYPES.map((type) => (
                                <Listbox.Option key={type.id} value={type} as={Fragment}>
                                  {({ active, selected }) => (
                                    <li
                                      className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                                        active ? "bg-gray-50" : ""
                                      }`}
                                    >
                                      <span className={`shrink-0 ${selected ? "text-gray-900" : "text-ink-400"}`}>
                                        {type.icon}
                                      </span>
                                      <div className="min-w-0">
                                        <p className={`text-[13px] font-medium ${selected ? "text-gray-900" : "text-gray-700"}`}>
                                          {type.label}
                                        </p>
                                        <p className="text-[11px] text-ink-400 truncate">{type.description}</p>
                                      </div>
                                      {selected && (
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-900 ml-auto shrink-0">
                                          <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
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

                    {/* Feedback textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[12px] font-medium text-ink-100 uppercase tracking-wide">
                          Description
                        </label>
                        <span className={`text-[11px] tabular-nums ${charsLeft < 100 ? "text-amber-500" : "text-ink-400"}`}>
                          {charsLeft} left
                        </span>
                      </div>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value.slice(0, MAX_CHARS))}
                        placeholder="Describe the issue in detail. What did you expect? What happened instead?"
                        rows={4}
                        className="w-full text-[13px] text-gray-800 placeholder-gray-300 border border-border-secondary rounded-xl px-3.5 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors"
                      />
                    </div>

                    {/* Attachments */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[12px] font-medium text-ink-100 uppercase tracking-wide">
                          Attachments
                        </label>
                        <span className="text-[11px] text-ink-400">{files.length}/{MAX_FILES}</span>
                      </div>

                      {/* Drop zone */}
                      {files.length < MAX_FILES && (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-5 cursor-pointer transition-colors ${
                            isDragging
                              ? "border-gray-400 bg-gray-50"
                              : "border-border-secondary hover:border-border-secondary hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-ink-400">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                              <path d="M7.5 10V2M7.5 2L4.5 5M7.5 2L10.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 11v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-[12px] font-medium text-gray-600">
                              Drop files here or <span className="text-gray-900 underline underline-offset-2">browse</span>
                            </p>
                            <p className="text-[11px] text-ink-400 mt-0.5">PNG, JPG, PDF up to 10MB each</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                          />
                        </div>
                      )}

                      {/* File list */}
                      {files.length > 0 && (
                        <ul className="mt-2 space-y-1.5">
                          {files.map((file, i) => (
                            <li key={i} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                              <span className="text-ink-400">
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                  <path d="M2 1.5A.5.5 0 0 1 2.5 1h6l3 3v8a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 2 12V1.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                                  <path d="M8.5 1v3h3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                                </svg>
                              </span>
                              <span className="text-[12px] text-gray-700 truncate flex-1">{file.name}</span>
                              <span className="text-[11px] text-ink-400 shrink-0">
                                {(file.size / 1024).toFixed(0)}KB
                              </span>
                              <button
                                onClick={() => removeFile(i)}
                                className="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M1 1l10 10M11 1 1 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border-secondary ">
                    <button
                      onClick={handleClose}
                      className="text-[13px] text-ink-100 hover:text-gray-700 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit || isSubmitting}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                        canSubmit && !isSubmitting
                          ? "bg-primary text-white hover:bg-gray-800 active:scale-[0.98]"
                          : "bg-[#868E96] text-white cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" strokeLinecap="round"/>
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          Send feedback
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
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

function SuccessState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-4">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-green-500">
          <path d="M4 10l5 5 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-[15px] font-semibold text-gray-900">Feedback received</p>
      <p className="text-[13px] text-ink-400 mt-1">Thanks for sharing — we really appreciate it.</p>
    </div>
  );
}