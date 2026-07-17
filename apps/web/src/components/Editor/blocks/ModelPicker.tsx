"use client";

import type { KeyboardEvent } from "react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import Image from "next/image";

import { AIChatIcon } from "@/components/Assets/AIChatIcon";

import type { NormalizedModel } from "../hooks/useOpenRouterModel";

// =====================================
// ⬢ Constants
// =====================================
const PROVIDER_DOMAINS: Record<string, string> = {
  anthropic: "anthropic.com",
  openai: "openai.com",
  google: "google.com",
  "meta-llama": "meta.com",
  mistralai: "mistral.ai",
  deepseek: "deepseek.com",
  "x-ai": "x.ai",
  qwen: "qwen.ai",
  openrouter: "openrouter.ai",
  moonshotai: "moonshot.cn",
  nvidia: "nvidia.com",
  minimax: "minimax.io",
  cohere: "cohere.com",
  perplexity: "perplexity.ai",
  amazon: "amazonaws.com",
  microsoft: "microsoft.com",
  bytedance: "bytedance.com",
  "bytedance-seed": "bytedance.com",
  deepcogito: "deepcogito.com",
  inception: "inceptionlabs.ai",
  liquid: "liquid.ai",
  liquidai: "liquid.ai",
  morph: "morphllm.com",
  switchpoint: "switchpoint.dev",
  upstage: "upstage.ai",
  "arcee-ai": "arcee.ai",
  allenai: "allenai.org",
  "z-ai": "zhipuai.cn",
  nousresearch: "nousresearch.com",
  writer: "writer.com",
  baidu: "baidu.com",
  tencent: "tencent.com",
};

// =====================================
// ⬢ Provider Colors
// =====================================
const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "#d97706",
  openai: "#10b981",
  google: "#3b82f6",
  "meta-llama": "#8b5cf6",
  mistralai: "#f43f5e",
  deepseek: "#06b6d4",
  "x-ai": "#64748b",
  qwen: "#f97316",
  openrouter: "#6366f1",
  moonshotai: "#ec4899",
  nvidia: "#22c55e",
  minimax: "#a855f7",
  bytedance: "#1d4ed8",
  "bytedance-seed": "#1d4ed8",
  deepcogito: "#0891b2",
  inception: "#7c3aed",
  liquid: "#0d9488",
  morph: "#dc2626",
  switchpoint: "#ea580c",
  upstage: "#4f46e5",
  "arcee-ai": "#be185d",
  allenai: "#15803d",
  "z-ai": "#1e40af",
};

// =====================================
// ⬢ Provider Icon
// =====================================
function ProviderIcon({
  provider,
  size = 28,
}: {
  provider: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const domain = PROVIDER_DOMAINS[provider];
  const color = PROVIDER_COLORS[provider] ?? "#6366f1";
  const abbr = provider.slice(0, 2).toUpperCase();

  if (!domain || failed) {
    return (
      <span
        style={{
          width: size,
          height: size,
          background: `${color}22`,
          color,
          fontSize: size * 0.32,
          borderRadius: Math.round(size * 0.28),
        }}
        className="flex items-center justify-center font-mono font-semibold shrink-0 select-none"
      >
        {abbr}
      </span>
    );
  }

  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={provider}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: Math.round(size * 0.28), flexShrink: 0 }}
      className="object-contain"
    />
  );
}

function InfoIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={clsx(
        "w-3.5 h-3.5 transition-colors duration-150",
        active ? "text-primary" : "text-ink-400 group-hover/info:text-ink-200"
      )}
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        strokeWidth="1.3"
        className="stroke-current"
      />
      <path
        d="M8 7v4"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="stroke-current"
      />
      <circle cx="8" cy="5" r="0.75" className="fill-current" />
    </svg>
  );
}

type Cap = "free" | "vision" | "video" | "tools" | "reasoning";

const CAP_META: Record<Cap, { label: string; cls: string }> = {
  free: {
    label: "Free",
    cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  vision: {
    label: "Vision",
    cls: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  },
  video: {
    label: "Video",
    cls: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  },
  tools: {
    label: "Tools",
    cls: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  reasoning: {
    label: "Reasoning",
    cls: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
};

// =====================================
// ⬢ Get Caps
// =====================================
function getCaps(model: NormalizedModel): Cap[] {
  const caps: Cap[] = [];
  const id = model.id.toLowerCase();

  if (model.isFree) caps.push("free");
  if (model.inputModalities.includes("image")) caps.push("vision");
  if (model.inputModalities.includes("video")) caps.push("video");
  if (model.supportsTools) caps.push("tools");
  if (
    model.isReasoning ||
    id.includes("r1") ||
    id.includes("thinking") ||
    id.includes("o1") ||
    id.includes("o3") ||
    id.includes("o4") ||
    id.includes("qwq")
  )
    caps.push("reasoning");

  return caps;
}

// =====================================
// ⬢ Price Hint
// =====================================
function PriceHint({ model }: { model: NormalizedModel }) {
  if (
    model.isFree ||
    model.promptPricePerM === null ||
    model.promptPricePerM === 0
  )
    return null;

  const perM = model.promptPricePerM;
  const outM = model.outputPricePerM ?? 0;
  const title = `$${perM.toFixed(3)}/M in · $${outM.toFixed(3)}/M out`;

  let sym: string;
  let cls: string;
  if (perM < 0.5) {
    sym = "¢";
    cls = "text-emerald-400/70";
  } else if (perM < 3) {
    sym = "¢¢";
    cls = "text-amber-400";
  } else {
    sym = "¢¢¢";
    cls = "text-rose-400";
  }

  return (
    <span title={title} className={clsx("font-mono text-[10px] shrink-0", cls)}>
      {sym}
    </span>
  );
}

const fmtCtx = (n: number | null) => {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
};

// =====================================
// ⬢ Recommended Models
// =====================================
const RECOMMENDED: { id: string; reason: string }[] = [
  { id: "anthropic/claude-sonnet-4.5", reason: "Best for complex notebooks" },
  { id: "anthropic/claude-haiku-4.5", reason: "Fast & cost-efficient" },
  { id: "openai/gpt-4.1", reason: "Strong tool calling" },
  { id: "openai/gpt-4.1-mini", reason: "Balanced speed + quality" },
  { id: "google/gemini-2.5-flash", reason: "Long context, multimodal" },
  { id: "google/gemini-2.5-pro", reason: "Top reasoning" },
  { id: "deepseek/deepseek-v3.2", reason: "Cheap, highly capable" },
  { id: "deepseek/deepseek-r1", reason: "Best open reasoning model" },
  { id: "qwen/qwen3-coder", reason: "Optimized for code gen" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", reason: "Free tier" },
  { id: "mistralai/devstral-small", reason: "Code agent specialist" },
  { id: "minimax/minimax-m1", reason: "1M token context window" },
];
const REC_MAP = new Map(RECOMMENDED.map(r => [r.id, r.reason]));

// =====================================
// ⬢ Model Row
// =====================================
function ModelRow({
  model,
  isSelected,
  isFocused,
  onClick,
  rowRef,
}: {
  model: NormalizedModel;
  isSelected: boolean;
  isFocused: boolean;
  onClick: () => void;
  rowRef?: (el: HTMLButtonElement | null) => void;
}) {
  const [descOpen, setDescOpen] = useState(false);
  const caps = getCaps(model);
  const reason = REC_MAP.get(model.id);

  return (
    <div
      className={clsx(
        "rounded-xl border transition-all duration-100",
        isSelected
          ? "bg-primary/10 border-primary/40"
          : isFocused
            ? "bg-white/[0.06] border-white/10"
            : "border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
      )}
    >
      <button
        ref={rowRef}
        type="button"
        onClick={onClick}
        tabIndex={-1}
        className="w-full text-left px-3 py-2.5 outline-none"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <ProviderIcon provider={model.provider} size={28} />
          </div>

          <div className="flex flex-col min-w-0 flex-1 gap-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className={clsx(
                  "font-body text-[13px] font-medium truncate leading-tight",
                  isSelected ? "text-primary" : "text-ink-100"
                )}
              >
                {model.name}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <PriceHint model={model} />
                <span className="font-body text-[10px] text-ink-400 tabular-nums">
                  {fmtCtx(model.contextLength)} ctx
                </span>
                {model.description && (
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={e => {
                      e.stopPropagation();
                      setDescOpen(v => !v);
                    }}
                    className="group/info flex items-center justify-center w-5 h-5 rounded hover:bg-white/[0.08] transition-colors shrink-0"
                    aria-label={
                      descOpen ? "Hide description" : "Show description"
                    }
                  >
                    <InfoIcon active={descOpen} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {caps.map(c => (
                <span
                  key={c}
                  className={clsx(
                    "font-body text-[9px] font-semibold px-1.5 py-0.5 rounded border leading-none",
                    CAP_META[c].cls
                  )}
                >
                  {CAP_META[c].label}
                </span>
              ))}
              {reason && (
                <span className="font-body text-[10px] text-ink-400 ml-0.5 truncate">
                  — {reason}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      <Transition
        show={descOpen}
        enter="transition-all duration-200 ease-out"
        enterFrom="opacity-0 max-h-0"
        enterTo="opacity-100 max-h-32"
        leave="transition-all duration-150 ease-in"
        leaveFrom="opacity-100 max-h-32"
        leaveTo="opacity-0 max-h-0"
      >
        <div className="overflow-hidden">
          <p className="font-body text-[11px] text-ink-400 leading-relaxed px-3 pb-2.5 ml-[44px]">
            {model.description}
          </p>
        </div>
      </Transition>
    </div>
  );
}

// =====================================
// ⬢ Divider
// =====================================
function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 mt-1 shrink-0">
      <span className="font-body text-[10px] font-semibold text-ink-400 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <span className="flex-1 h-px bg-border-tertiary" />
    </div>
  );
}

// =====================================
// ⬢ Types
// =====================================
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

// =====================================
// ⬢ Model Picker Modal
// =====================================
const ALL = "all";
const fmtProv = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

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
  const [activeProvider, setProvider] = useState<string>(ALL);
  const [showAll, setShowAll] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(selectedModelId);
  const [focusedIdx, setFocusedIdx] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (!isOpen) return;
    setPendingId(selectedModelId);
    setSearch("");
    setProvider(ALL);
    setShowAll(false);
    setFocusedIdx(0);
    setTimeout(() => searchRef.current?.focus(), 50);
  }, [isOpen, selectedModelId]);

  const providers = useMemo(
    () => Array.from(new Set(models.map(m => m.provider))).sort(),
    [models]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return models.filter(m => {
      const textOut = m.outputModalities.includes("text");
      const byProv = activeProvider === ALL || m.provider === activeProvider;
      const byQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);
      return textOut && byProv && byQuery;
    });
  }, [models, search, activeProvider]);

  const isSearching = search.length > 0 || activeProvider !== ALL;

  const { recommended, rest } = useMemo(
    () => ({
      recommended: filtered.filter(m => REC_MAP.has(m.id)),
      rest: filtered.filter(m => !REC_MAP.has(m.id)),
    }),
    [filtered]
  );

  const visibleList = useMemo(() => {
    if (isSearching) return filtered;
    return showAll ? [...recommended, ...rest] : recommended;
  }, [isSearching, filtered, recommended, rest, showAll]);

  useEffect(() => {
    rowRefs.current
      .get(focusedIdx)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusedIdx]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIdx(i => Math.min(i + 1, visibleList.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIdx(i => Math.max(i - 1, 0));
          break;
        case "Enter": {
          e.preventDefault();
          const focused = visibleList[focusedIdx];
          if (!focused) break;
          if (pendingId === focused.id) {
            onSelect(focused.id);
            onClose();
          } else {
            setPendingId(focused.id);
          }
          break;
        }
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "Tab": {
          e.preventDefault();
          const all = [ALL, ...providers];
          const idx = all.indexOf(activeProvider);
          setProvider(
            all[(idx + (e.shiftKey ? -1 : 1) + all.length) % all.length]!
          );
          setFocusedIdx(0);
          break;
        }
        default:
          break;
      }
    },
    [
      visibleList,
      focusedIdx,
      pendingId,
      onSelect,
      onClose,
      providers,
      activeProvider,
    ]
  );

  const pendingModel = useMemo(
    () => models.find(m => m.id === pendingId) ?? null,
    [models, pendingId]
  );

  const handleConfirm = useCallback(() => {
    if (pendingId) {
      onSelect(pendingId);
      onClose();
    }
  }, [pendingId, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 z-50 bg-black/40 animate-in fade-in duration-150 cursor-default"
        onClick={onClose}
        tabIndex={-1}
      />
      <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="relative w-full max-w-[620px] max-h-[80vh] flex flex-col bg-base-100 border border-border-secondary rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 duration-200 outline-none pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-secondary shrink-0">
            <div className="flex items-center gap-3">
              <AIChatIcon />
              <span className="font-body text-[15px] font-semibold text-ink-100">
                {title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-body text-[10px] text-ink-400 hidden sm:block select-none">
                ↑↓ navigate · Enter select · Tab filter · Esc close
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-400 hover:text-ink-100 hover:bg-white/[0.06] text-xs px-2 py-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pt-3 pb-0 shrink-0">
            <div
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-border-secondary",
                "focus-within:border-primary/50 transition-colors"
              )}
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="w-4 h-4 shrink-0 text-ink-400"
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
              <input
                ref={searchRef}
                type="text"
                placeholder="Search models…"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setFocusedIdx(0);
                }}
                onKeyDown={e => {
                  if (
                    ["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)
                  ) {
                    handleKeyDown(e as unknown as KeyboardEvent<HTMLElement>);
                  }
                }}
                className="flex-1 bg-transparent font-body text-sm text-ink-100 placeholder:text-ink-400 outline-none caret-primary"
                autoComplete="off"
                spellCheck={false}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFocusedIdx(0);
                  }}
                  className="text-ink-400 hover:text-ink-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Provider pills */}
          <div className="flex gap-1.5 px-4 py-3 overflow-x-auto shrink-0 [scrollbar-width:none]">
            {[ALL, ...providers].map(p => (
              <button
                type="button"
                key={p}
                onClick={() => {
                  setProvider(p);
                  setFocusedIdx(0);
                }}
                className={clsx(
                  "shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-[11px] font-medium border transition-all whitespace-nowrap",
                  activeProvider === p
                    ? "bg-primary/15 border-primary/60 text-purple-400"
                    : "bg-transparent border-border-tertiary text-ink-400 hover:border-ink-400"
                )}
              >
                {p !== ALL && <ProviderIcon provider={p} size={13} />}
                {p === ALL ? "All" : fmtProv(p)}
              </button>
            ))}
          </div>

          {/* Column headers */}
          <div className="flex items-center justify-between px-4 pb-1 shrink-0">
            <span className="font-body text-[10px] text-ink-400 uppercase tracking-widest">
              Model
            </span>
            <span className="font-body text-[10px] text-ink-400 uppercase tracking-widest">
              Context
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255/0.08)_transparent]">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <span className="font-body text-xs text-ink-400">
                  Loading models…
                </span>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center py-12">
                <span className="font-body text-xs text-rose-400">
                  Failed to load models
                </span>
              </div>
            )}

            {!loading && !error && (
              <>
                {isSearching && (
                  <>
                    {filtered.length === 0 && (
                      <div className="flex items-center justify-center py-12">
                        <span className="font-body text-xs text-ink-400">
                          No models match
                        </span>
                      </div>
                    )}
                    {filtered.map((m, i) => (
                      <ModelRow
                        key={m.id}
                        model={m}
                        isSelected={m.id === pendingId}
                        isFocused={i === focusedIdx}
                        onClick={() => {
                          setPendingId(m.id);
                          setFocusedIdx(i);
                        }}
                        rowRef={el => {
                          if (el) rowRefs.current.set(i, el);
                          else rowRefs.current.delete(i);
                        }}
                      />
                    ))}
                  </>
                )}

                {!isSearching && (
                  <>
                    {recommended.length > 0 && (
                      <>
                        <Divider label="Recommended for Sandworm" />
                        {recommended.map((m, i) => (
                          <ModelRow
                            key={m.id}
                            model={m}
                            isSelected={m.id === pendingId}
                            isFocused={i === focusedIdx}
                            onClick={() => {
                              setPendingId(m.id);
                              setFocusedIdx(i);
                            }}
                            rowRef={el => {
                              if (el) rowRefs.current.set(i, el);
                              else rowRefs.current.delete(i);
                            }}
                          />
                        ))}
                      </>
                    )}

                    {!showAll && rest.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAll(true)}
                        className="w-full mt-2 py-2.5 font-body text-[12px] text-ink-400 hover:text-ink-200 border border-dashed border-border-tertiary rounded-xl hover:border-ink-400 transition-colors"
                      >
                        + Show {rest.length} more models
                      </button>
                    )}

                    {showAll && rest.length > 0 && (
                      <>
                        <Divider label="All Models" />
                        {rest.map((m, i) => {
                          const idx = recommended.length + i;
                          return (
                            <ModelRow
                              key={m.id}
                              model={m}
                              isSelected={m.id === pendingId}
                              isFocused={idx === focusedIdx}
                              onClick={() => {
                                setPendingId(m.id);
                                setFocusedIdx(idx);
                              }}
                              rowRef={el => {
                                if (el) rowRefs.current.set(idx, el);
                                else rowRefs.current.delete(idx);
                              }}
                            />
                          );
                        })}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border-tertiary shrink-0 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {pendingModel && (
                <ProviderIcon provider={pendingModel.provider} size={22} />
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-body text-[11px] text-ink-400">
                  {pendingModel ? "Selected" : "None selected"}
                </span>
                {pendingModel && (
                  <span className="font-body text-[12px] font-medium text-primary truncate max-w-[200px]">
                    {pendingModel.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-body text-[13px] font-medium text-ink-400 hover:text-ink-200 hover:bg-white/[0.06] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!pendingId || pendingId === selectedModelId}
                className="px-5 py-2 rounded-lg font-body text-[13px] font-medium bg-primary text-white hover:bg-[#8e07d4] disabled:bg-disabled disabled:cursor-not-allowed transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
