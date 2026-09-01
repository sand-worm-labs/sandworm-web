"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import Image from "next/image";
import { PiArrowRightLight } from "react-icons/pi";

import { SparkleAI } from "@/components/Assets/SparkleAI";

import type { NormalizedModel } from "../hooks/useOpenRouterModel";

// =====================================
// ⬢ Constants
// =====================================

const PROVIDER_DOMAINS: Record<string, string> = {
  anthropic: "claude.ai",
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

export const AUTO_MODEL_ID = "openrouter/auto";

const EFFORT_LEVELS = ["low", "medium", "high", "extra-high", "max"] as const;

const EFFORT_LABELS: Record<EffortLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  "extra-high": "Extra High",
  max: "Max",
};

const RECENT_STORAGE_KEY = "sandworm:recent-models";
const MAX_RECENT = 4;

// =====================================
// ⬢ Types
// =====================================

export type EffortLevel = (typeof EFFORT_LEVELS)[number];

/**
 * NormalizedModel needs `supportedParameters` mapped from OpenRouter's
 * `supported_parameters` in useOpenRouterModel — effort is gated on it.
 */
type ModelWithCaps = NormalizedModel & {
  supportedParameters?: string[];
};

export interface ModelQuickSelectProps {
  models: NormalizedModel[];
  selectedModelId: string | null;
  onSelect: (modelId: string) => void;
  onBrowseAll: () => void;
  showBrowseAll?: boolean;
  effort?: EffortLevel;
  onEffortChange?: (effort: EffortLevel) => void;
  /** Trigger button styling — "compact" is used in tighter spaces (e.g. the mini chat). */
  variant?: "default" | "compact";
  /** Which side of the trigger the dropdown panel opens on. */
  dropdownPosition?: "top" | "bottom";
  /** Which edge the dropdown panel aligns to. */
  dropdownAlign?: "left" | "right";
}

// =====================================
// ⬢ Utils
// =====================================

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
  recentIds: string[],
  excludeId: string | null
): NormalizedModel[] {
  const seen = new Set<string>();
  const result: NormalizedModel[] = [];

  const tryAdd = (id: string) => {
    if (seen.has(id) || id === excludeId) return;
    const model = models.find(m => m.id === id);
    if (!model) return;
    result.push(model);
    seen.add(id);
  };

  [...recentIds, ...QUICK_SELECT_DEFAULTS].forEach(id => {
    if (result.length < MAX_RECENT) tryAdd(id);
  });

  return result;
}

function modelSupportsEffort(model: ModelWithCaps | undefined): boolean {
  if (!model) return false;
  const params = model.supportedParameters ?? [];
  return params.includes("reasoning") || params.includes("reasoning_effort");
}

// =====================================
// ⬢ Icons
// =====================================

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
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={provider}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: Math.round(size * 0.3), flexShrink: 0 }}
      className="object-contain"
    />
  );
}

function AutoIcon({ size = 14 }: { size?: number }) {
  return <SparkleAI size={size} />;
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

// =====================================
// ⬢ Components — selected header
// =====================================

function SelectedModelCard({ model }: { model: ModelWithCaps | undefined }) {
  const isAuto = !model || model.id === AUTO_MODEL_ID;

  return (
    <div className="mx-1.5 mt-1.5 mb-2 flex items-center gap-3 rounded-xl px-3 py-1.5 bg-sidebar-hover dark:bg-base-720">
      {isAuto ? (
        <AutoIcon size={26} />
      ) : (
        <ProviderIcon provider={model.provider} size={30} />
      )}
      <div className="min-w-0">
        <div className="font-body text-[12.5px] font-medium text-ink-100 truncate leading-tight">
          {isAuto ? "Auto" : stripProviderPrefix(model.name)}
        </div>
        <div className="font-body text-[12px] font-medium truncate text-ink-400">
          {isAuto ? "OpenRouter" : model.provider}
        </div>
      </div>
    </div>
  );
}

// =====================================
// ⬢ Components — pills
// =====================================

function ModelPill({
  model,
  onClick,
}: {
  model: NormalizedModel;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white dark:bg-transparent hover:bg-hover-bg dark:hover:bg-base-710 hover:border-primary border-border dark:border-base-710 transition-colors duration-100 border"
    >
      <ProviderIcon provider={model.provider} size={15} />
      <span className="font-body text-[13px] font-medium text-ink-100 truncate max-w-[110px]">
        {stripProviderPrefix(model.name)}
      </span>
    </button>
  );
}

function AutoPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white dark:bg-transparent hover:bg-hover-bg dark:hover:bg-base-710 hover:border-primary border-border dark:border-base-710 transition-colors duration-100 border"
    >
      <AutoIcon size={14} />
      <span className="font-body text-[13px] font-medium text-ink-100">
        Auto
      </span>
    </button>
  );
}

// =====================================
// ⬢ Components — effort selector
// =====================================

function EffortSelector({
  effort,
  onChange,
}: {
  effort: EffortLevel;
  onChange: (e: EffortLevel) => void;
}) {
  return (
    <div className="px-3 pt-2 pb-1">
      <div className="font-body text-[10.5px] font-semibold uppercase tracking-wider mb-1.5 text-ink-400">
        Effort
      </div>
      <div className="flex items-center gap-0.5 rounded-xl p-1 bg-sidebar-hover dark:bg-base-720">
        {EFFORT_LEVELS.map(level => {
          const active = level === effort;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={clsx(
                "flex-1 rounded-lg px-1.5 py-1 font-body text-[11.5px] font-medium border",
                "transition-all duration-100 whitespace-nowrap",
                active
                  ? "text-primary bg-base-100 border-primary"
                  : "text-ink-400 border-transparent hover:text-ink-100"
              )}
            >
              {EFFORT_LABELS[level]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =====================================
// ⬢ Main
// =====================================

export function ModelQuickSelect({
  models,
  selectedModelId,
  onSelect,
  onBrowseAll,
  showBrowseAll = true,
  effort = "medium",
  onEffortChange,
  variant = "default",
  dropdownPosition = "bottom",
  dropdownAlign = "left",
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

  // ── handlers
  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      if (id !== AUTO_MODEL_ID) {
        pushRecentModelId(id);
        setRecentIds(getRecentModelIds());
      }
    },
    [onSelect]
  );

  const handleBrowseAll = useCallback(() => {
    setOpen(false);
    onBrowseAll();
  }, [onBrowseAll]);

  const activeModel = models.find(m => m.id === selectedModelId) as
    | ModelWithCaps
    | undefined;
  const isAutoSelected = selectedModelId === AUTO_MODEL_ID || !activeModel;
  const quickList = buildQuickList(models, recentIds, selectedModelId);
  const showEffort = !!onEffortChange && modelSupportsEffort(activeModel);

  const isCompact = variant === "compact";

  return (
    <div ref={containerRef} className="relative">
      {/* ── trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clsx(
          "flex items-center h-fit",
          "font-body font-medium border transition-all duration-200",
          isCompact
            ? clsx(
                "gap-1 rounded-full px-2 py-1 text-[11px] bg-base-200 dark:bg-base-720 text-ink-100 dark:text-ink-200",
                open
                  ? "border-primary"
                  : "border-hover-border dark:border-base-710"
              )
            : clsx(
                "gap-1.5 rounded-full px-3 py-2 text-xs",
                open
                  ? "bg-[rgba(207,211,222,0.6)] dark:bg-white/10"
                  : "bg-border-cool dark:bg-transparent border-transparent",
                !open &&
                  "text-ink-100 hover:bg-border-cool hover:border-primary dark:hover:bg-[rgba(255,255,255,0.08)]"
              )
        )}
      >
        {!isCompact &&
          (isAutoSelected ? (
            <AutoIcon size={13} />
          ) : (
            <ProviderIcon provider={activeModel!.provider} size={14} />
          ))}
        <span className="max-w-[120px] truncate">
          {isAutoSelected ? "Auto" : stripProviderPrefix(activeModel!.name)}
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
        <div
          className={clsx(
            "absolute w-[300px] z-50 bg-base-100 dark:bg-dropdown-bg border border-border-tertiary rounded-2xl shadow-[0px_1.5px_13px_3px_#526A9F1F] pb-1.5 overflow-hidden",
            dropdownPosition === "top" ? "bottom-full mb-2" : "top-[3rem] mb-2",
            dropdownAlign === "right" ? "right-0" : "left-0"
          )}
        >
          <SelectedModelCard model={isAutoSelected ? undefined : activeModel} />

          {/* quick pills: auto + recents/defaults */}
          <div className="flex flex-wrap gap-1.5 px-3 pb-1.5">
            {!isAutoSelected && (
              <AutoPill onClick={() => handleSelect(AUTO_MODEL_ID)} />
            )}
            {quickList.map(m => (
              <ModelPill
                key={m.id}
                model={m}
                onClick={() => handleSelect(m.id)}
              />
            ))}
          </div>

          {showEffort && (
            <EffortSelector effort={effort} onChange={onEffortChange!} />
          )}

          {showBrowseAll && (
            <button
              type="button"
              onClick={handleBrowseAll}
              className="w-full flex items-center gap-2 px-3 py-2 mt-0.5 text-left hover:bg-primary/15 transition-colors duration-100 group justify-between"
            >
              <span className="font-body text-[12px] group-hover:text-ink-200 transition-colors text-ink-400">
                Browse all models
              </span>
              <PiArrowRightLight className="text-ink-400" />
            </button>
          )}
        </div>
      </Transition>
    </div>
  );
}
