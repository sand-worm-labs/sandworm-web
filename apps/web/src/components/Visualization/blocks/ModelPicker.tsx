"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";

import { AIChatIcon } from "@/components/Assets/AIChatIcon";

import type { NormalizedModel } from "../hooks/useOpenRouterModel";

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={clsx("w-4 h-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M11 2L4 11h6l-1 7 7-9h-6l1-7z"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4 shrink-0 text-ink-400"
      aria-hidden="true"
    >
      <circle
        cx="8.5"
        cy="8.5"
        r="5"
        strokeWidth="1.5"
        className="stroke-current"
      />
      <path
        d="M15 15l-2.5-2.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="stroke-current"
      />
    </svg>
  );
}

export interface ModelPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: NormalizedModel[];
  loading: boolean;
  error?: Error | null;
  selectedModelId: string | null;
  onSelect: (modelId: string) => void;
  title?: string;
}

const formatContext = (tokens: number | null): string => {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(0)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return String(tokens);
};

const formatProvider = (provider: string): string =>
  provider.charAt(0).toUpperCase() + provider.slice(1);

const ALL = "all";

export const ModelPickerModal = ({
  isOpen,
  onClose,
  models,
  loading,
  error,
  selectedModelId,
  onSelect,
  title = "Select Model",
}: ModelPickerModalProps) => {
  const [search, setSearch] = useState("");
  const [activeProvider, setActiveProvider] = useState<string>(ALL);
  const [pendingId, setPendingId] = useState<string | null>(selectedModelId);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPendingId(selectedModelId);
      setSearch("");
      setActiveProvider(ALL);
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen, selectedModelId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const providers = useMemo(
    () => Array.from(new Set(models.map(m => m.provider))).sort(),
    [models]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return models.filter(m => {
      const matchesProvider =
        activeProvider === ALL || m.provider === activeProvider;
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);
      return matchesProvider && matchesSearch;
    });
  }, [models, search, activeProvider]);

  const pendingModel = useMemo(
    () => models.find(m => m.id === pendingId) ?? null,
    [models, pendingId]
  );

  const handleConfirm = useCallback(() => {
    if (pendingId) onSelect(pendingId);
  }, [pendingId, onSelect]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0000001A]  animate-in fade-in duration-150"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full max-w-[620px] max-h-[70vh] flex flex-col bg-base-100 border border-border-secondary rounded-2xl  animate-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-secondary shrink-0">
          <div className="flex space-x-3 items-center">
            <AIChatIcon />
            <span className="text-base font-medium text-ink-100 leading-none">
              {title}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-ink-400 hover:text-ink-100 hover:bg-white/[0.06] text-xs px-2 py-1 rounded transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-3  shrink-0">
          <div
            className={clsx(
              "flex items-center gap-2.5 px-3 py-1.5 rounded-lg",
              "bg-white/[0.04] border border-border-secondary",
              "focus-within:border-[#A308F0]/40 ",
              "transition-colors"
            )}
          >
            <SearchIcon />

            <input
              ref={searchRef}
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-ink-100 placeholder:text-ink-400 outline-none caret-[#A308F0]"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 text-ink-400 hover:text-ink-400 text-[10px] transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-1.5 px-4 py-2.5 border-b border-border-tertiary overflow-x-auto shrink-0 [scrollbar-width:none]">
          {[ALL, ...providers].map(p => (
            <button
              type="button"
              key={p}
              onClick={() => setActiveProvider(p)}
              className={`shrink-0 px-2.5 py-1 rounded-full font-body  text-[11px] font-medium border transition-all whitespace-nowrap
                ${
                  activeProvider === p
                    ? "bg-[#A308F0]/15 border-[#A308F0]/60 text-purple-400"
                    : "bg-transparent border-border-tertiary text-ink-400  hover:order-border-tertiary  "
                }`}
            >
              {p === ALL ? "All" : formatProvider(p)}
            </button>
          ))}
        </div>

        {/* Model list */}
        <div className="flex-1 overflow-y-auto px-2 py-1.5 [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.1)_transparent]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <span className="font-body text-xs text-ink-400 ">
                Loading models...
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <span className="font-body text-xs text-error">
                Failed to load models
              </span>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <span className="font-body text-xs text-ink-400 ">
                No models match
              </span>
            </div>
          )}

          {!loading &&
            !error &&
            filtered.map(model => {
              const isSelected = model.id === pendingId;
              return (
                <button
                  type="button"
                  key={model.id}
                  onClick={() => setPendingId(model.id)}
                  className={`flex items-center justify-between w-full px-2.5 py-2.5 rounded-lg text-left transition-colors gap-3
                  ${isSelected ? "hover:bg-[#EBF7F7]" : "hover:bg-[#EBF7F7]"}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                        isSelected
                          ? "bg-[#DFEDED] border-none"
                          : "bg-white/[0.04] border border-white/10"
                      )}
                    >
                      <BoltIcon
                        className={clsx(
                          "transition-colors",
                          isSelected ? "text-[#005DE7]" : "text-ink-400"
                        )}
                      />
                    </span>

                    <div className="flex flex-col min-w-0 gap-px">
                      <span
                        className={`font-body  text-sm font-medium truncate transition-colors
                      ${isSelected ? "text-ink-100" : "text-ink-100"}`}
                      >
                        {model.name}
                      </span>
                      <span className="font-body text-[10px] text-ink-400">
                        {formatProvider(model.provider)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {model.isFree && (
                      <span className="font-body text-[11px]  px-2 py-0.5 rounded-md bg-[#F7E8FF] text-[#A308F0] font-medium ">
                        Free
                      </span>
                    )}
                    <span className="font-body text-[10px] text-ink-400  min-w-8 text-right">
                      {formatContext(model.contextLength)}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-tertiary shrink-0 gap-3">
          <div className="flex flex-col min-w-0 gap-px">
            <span className="font-body text-[11px] text-ink-400  font-medium">
              {pendingModel ? "Selected" : "None selected"}
            </span>
            {pendingModel && (
              <span className="font-body  text-xs font-medium text-accent truncate max-w-56">
                {pendingModel.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!pendingId || pendingId === selectedModelId}
              className="px-5 py-2 rounded-lg font-body  text-[13px] font-medium bg-[#A308F0] text-white hover:bg-[#8e07d4] disabled:bg-[#868E96] disabled:cursor-not-allowed transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
