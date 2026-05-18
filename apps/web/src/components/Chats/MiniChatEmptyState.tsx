"use client";

import React from "react";

import { AIChatIcon } from "../Assets/AIChatIcon";

// =====================================
// ⬢ Constants
// =====================================

const EXAMPLE_PROMPTS = [
  {
    label: "Token analytics",
    prompt:
      "Show me the top 20 holders of USDC on Base, including their balance changes over the past 30 days",
  },
  {
    label: "Python analysis",
    prompt:
      "Use Python to cluster wallets on Base by their transaction behaviour and flag any that look like bots",
  },
  {
    label: "Visualize",
    prompt:
      "Create a chart showing daily DEX trading volume on Base broken down by protocol over the last 60 days",
  },
];

// =====================================
// ⬢ ExamplePrompts
// =====================================

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
}

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onSelect }) => (
  <div className="flex flex-col gap-2 w-full mt-6">
    {EXAMPLE_PROMPTS.map(item => (
      <button
        key={item.label}
        type="button"
        onClick={() => onSelect(item.prompt)}
        className="group flex items-start gap-3 w-full text-left px-4 py-2.5 rounded-xl border border-border-secondary dark:border-border-tertiary bg-white dark:bg-base-200 hover:border-primary/40 dark:hover:border-primary/40 hover:bg-primary/[0.03] dark:hover:bg-primary/[0.06] transition-all duration-150"
      >
        <span className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-ink-100 mb-0.5">
            {item.label}
          </span>
          <span className="text-[12.5px] text-ink-400 dark:text-ink-400 leading-snug line-clamp-2 group-hover:text-ink-200 dark:group-hover:text-ink-300 transition-colors duration-150">
            {item.prompt}
          </span>
        </span>
      </button>
    ))}
  </div>
);

// =====================================
// ⬢ MiniChatEmptyState
// =====================================

interface MiniChatEmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const MiniChatEmptyState: React.FC<MiniChatEmptyStateProps> = ({
  onSelectPrompt,
}) => (
  <div className="flex flex-col items-center py-8 font-body justify-end h-full">
    <div className="flex flex-col items-center">
      <AIChatIcon />
      <p className="font-body text-sm text-ink-300 dark:text-ink-400 text-center max-w-[12rem] mt-5">
        Search any data type across multiple blockchains
      </p>
    </div>
    <ExamplePrompts onSelect={onSelectPrompt} />
  </div>
);
