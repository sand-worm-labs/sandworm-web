"use client";

import { useState } from "react";
import { PiBookOpen, PiCaretRight, PiDiscordLogo } from "react-icons/pi";

import { cn } from "@/lib/utils";
import { socialLinks } from "@/data/socialLinks";
import { footerLinks } from "@/data/footerLinks";

// =====================================
// ⬢ Constants
// =====================================
const DISCORD_URL =
  socialLinks.find(link => link.name === "Discord")?.href ??
  "https://discord.gg/pftQtpcjK2";

const DOCS_URL =
  footerLinks.find(link => link.label === "Docs")?.href ??
  "https://docs.sandwormlabs.xyz";

// =====================================
// ⬢ Data
// =====================================
const faqs = [
  {
    question: "Is Sandworm free to use?",
    answer:
      "Yes. Every workspace starts on a Trial with full product access while Sandworm is in public beta. Upgrade to Pro once your team needs more notebooks, storage or scheduled runs.",
  },
  {
    question: "What are AI credits?",
    answer:
      "AI credits meter usage of the AI assistant and AI-powered blocks (SQL, Python and Markdown generation), which run through OpenRouter under the hood. Each plan includes a monthly credit allowance shown on this page.",
  },
  {
    question: "What happens if I run out of AI credits?",
    answer:
      "AI-powered blocks pause until your credits reset next cycle. You can also add your own AI provider key from Workspace Settings → Account to keep generating without waiting.",
  },
  {
    question: "How do scheduled notebook runs work?",
    answer:
      "Pro and Enterprise workspaces can schedule a notebook to re-run automatically — hourly, daily, weekly, monthly, or on a custom cron expression — so dashboards stay fresh without manual runs.",
  },
  {
    question: "How is workspace storage calculated?",
    answer:
      "Storage covers every file and image uploaded to a notebook's upload block. It's shared across the whole workspace rather than per notebook, and usage drops when files are removed.",
  },
  {
    question: "Can I change or cancel my plan?",
    answer:
      "Pay-with-wallet upgrades are on the way. Until then, message us on Discord and we'll adjust your workspace's plan directly — no need to wait.",
  },
];

// =====================================
// ⬢ FAQ Row
// =====================================
function FaqRow({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[#F8F9FC] dark:bg-base-200 px-5 py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 text-left"
      >
        <span className="font-medium text-ink-100 dark:text-white">
          {question}
        </span>
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-100 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        >
          <PiCaretRight className="h-3.5 w-3.5" />
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pt-3 text-sm text-ink-400 dark:text-ink-400 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================
// ⬢ Plan FAQ
// =====================================
export default function PlanFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-10 rounded-3xl  p-6 sm:p-8 font-body">
      <div className="grid md:grid-cols-[260px_1fr] gap-8">
        {/* ✦ Left column ✦ */}
        <div>
          <h3 className="text-xl font-bold text-ink-100 dark:text-white mb-3">
            FAQ
          </h3>
          <p className="text-sm text-ink-400 dark:text-ink-400 mb-5">
            If your question isn&apos;t answered, check our{" "}
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline underline-offset-2"
            >
              Documentation
            </a>{" "}
            for more, or reach out on{" "}
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline underline-offset-2"
            >
              Discord
            </a>
            .
          </p>

          <div className="flex flex-wrap gap-2">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border dark:border-border-tertiary px-4 py-2 text-sm font-medium text-ink-100 dark:text-white hover:bg-hover-bg hover:border-primary dark:hover:bg-base-700 transition-colors"
            >
              <PiDiscordLogo className="h-4 w-4" />
              Community Support
            </a>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border dark:border-border-tertiary px-4 py-2 text-sm font-medium text-ink-100 dark:text-white hover:bg-hover-bg hover:border-primary dark:hover:bg-base-700 transition-colors"
            >
              <PiBookOpen className="h-4 w-4" />
              Documentation
            </a>
          </div>
        </div>

        {/* ✦ Questions ✦ */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <FaqRow
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(current => (current === index ? null : index))
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
