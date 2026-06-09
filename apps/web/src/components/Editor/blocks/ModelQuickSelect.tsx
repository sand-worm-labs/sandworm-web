"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import Image from "next/image";
import { PiArrowRightLight } from "react-icons/pi";

import type { NormalizedModel } from "../hooks/useOpenRouterModel";

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
  morph: "morphllm.com",
  switchpoint: "switchpoint.dev",
  upstage: "upstage.ai",
  "arcee-ai": "arcee.ai",
  allenai: "allenai.org",
  "z-ai": "zhipuai.cn",
  nousresearch: "nousresearch.com",
};

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

const QUICK_SELECT_DEFAULTS = [
  "anthropic/claude-sonnet-4.5",
  "openai/gpt-4.1-mini",
  "google/gemini-2.5-flash",
  "deepseek/deepseek-v3.2",
];

const RECENT_STORAGE_KEY = "sandworm:recent-models";
const MAX_RECENT = 4;

function getRecentModelIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function pushRecentModelId(id: string): void {
  if (typeof window === "undefined") return;
  const next = [id, ...getRecentModelIds().filter(m => m !== id)].slice(
    0,
    MAX_RECENT
  );
  localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
}

function stripProviderPrefix(name: string): string {
  return name.replace(/^[^:]+:\s*/, "");
}

function buildQuickList(
  models: NormalizedModel[],
  recentIds: string[]
): NormalizedModel[] {
  const seen = new Set<string>();
  const result: NormalizedModel[] = [];

  const tryAdd = (id: string) => {
    if (seen.has(id)) return;
    const model = models.find(m => m.id === id);
    if (!model) return;
    result.push(model);
    seen.add(id);
  };

  const candidates = [...recentIds, ...QUICK_SELECT_DEFAULTS];

  candidates.forEach(id => {
    if (result.length < MAX_RECENT) {
      tryAdd(id);
    }
  });

  return result;
}

function ProviderIcon({
  provider,
  size = 16,
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
          fontSize: size * 0.42,
          borderRadius: Math.round(size * 0.3),
        }}
        className="flex items-center justify-center font-mono font-semibold shrink-0 select-none"
      >
        {abbr}
      </span>
    );
  }

  return (
    <Image
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt={provider}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: Math.round(size * 0.3), flexShrink: 0 }}
      className="object-contain"
    />
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className={clsx(
        "w-3 h-3 shrink-0 opacity-60 transition-transform duration-150",
        open && "rotate-180"
      )}
    >
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className="w-3 h-3 shrink-0 text-[#A308F0]"
    >
      <path
        d="M2 6l3 3 5-5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-current"
      />
    </svg>
  );
}

export interface ModelQuickSelectProps {
  models: NormalizedModel[];
  selectedModelId: string | null;
  onSelect: (modelId: string) => void;
  onBrowseAll: () => void;
}

export function ModelQuickSelect({
  models,
  selectedModelId,
  onSelect,
  onBrowseAll,
}: ModelQuickSelectProps) {
  const [open, setOpen] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentIds(getRecentModelIds());
  }, []);

  useEffect(() => {
    if (!open) return () => {};
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return () => {};
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      pushRecentModelId(id);
      setRecentIds(getRecentModelIds());
      setOpen(false);
    },
    [onSelect]
  );

  const handleBrowseAll = useCallback(() => {
    setOpen(false);
    onBrowseAll();
  }, [onBrowseAll]);

  const quickList = buildQuickList(models, recentIds);
  const activeModel = models.find(m => m.id === selectedModelId);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clsx(
          "flex items-center gap-1.5 rounded-full px-3 py-2 h-fit",
          "font-body text-xs font-medium border transition-all duration-150",
          open
            ? "bg-[rgba(207,211,222,0.6)] "
            : " bg-[#E7EBF0] dark:bg-transparent  border-transparent",
          !open &&
            "text-ink-100  hover:bg-[rgba(207,211,222,0.6)] dark:hover:bg-[rgba(255,255,255,0.08)]"
        )}
      >
        {activeModel && (
          <ProviderIcon provider={activeModel.provider} size={14} />
        )}
        <span className="max-w-[120px] truncate">
          {activeModel ? stripProviderPrefix(activeModel.name) : "Select model"}
        </span>
        <ChevronDownIcon open={open} />
      </button>

      <Transition
        show={open}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-y-1 scale-95"
        enterTo="opacity-100 translate-y-0 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 translate-y-0 scale-100"
        leaveTo="opacity-0 translate-y-1 scale-95"
      >
        <div className="absolute top-[3rem] left-0 mb-2 w-[260px] z-50 bg-base-100 border border-border-tertiary rounded-2xl shadow-[0_0.5px_4px_#2516660A] py-1.5 overflow-hidden">
          {quickList.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelect(m.id)}
              className={clsx(
                "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100",
                m.id === selectedModelId
                  ? "bg-[#A308F0]/08 text-[#A308F0]"
                  : "hover:bg-primary/15 text-ink-100"
              )}
            >
              <ProviderIcon provider={m.provider} size={18} />
              <span className="font-body text-[12.5px] font-medium truncate flex-1">
                {stripProviderPrefix(m.name)}
              </span>
              {m.id === selectedModelId && <CheckIcon />}
            </button>
          ))}

          <button
            type="button"
            onClick={handleBrowseAll}
            className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-primary/15 transition-colors duration-100 group justify-between"
          >
            <span className="font-body text-[12px] text-ink-400 group-hover:text-ink-200 transition-colors">
              Browse all models
            </span>
            <span>
              <PiArrowRightLight />
            </span>
          </button>
        </div>
      </Transition>
    </div>
  );
}
