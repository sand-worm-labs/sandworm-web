"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ShowcaseLeadTarget } from "@/types";

import { ShowcaseLeadModal } from "./ShowcaseLeadModal";

// =====================================
// ⬢  Constants
// =====================================
const VARIANT_CLASS = {
  primary: "bg-primary text-white hover:bg-primary-710",
  outline:
    "border-[1.5px] border-primary text-primary dark:text-primary-tint-75 dark:border-hover-border",
  // For the dark case-study hero.
  light: "bg-white text-ink-navy hover:bg-white/90",
  ghost: "border border-white/25 text-white hover:bg-white/10",
};

// =====================================
// ⬢  ShowcaseLeadButton
// =====================================
// A button that opens the lead form for one target. Lets server-rendered
// pages offer "request coverage", "request a report" and "claim this page".
export function ShowcaseLeadButton({
  target,
  variant = "primary",
  children,
  className,
}: {
  target: ShowcaseLeadTarget;
  variant?: keyof typeof VARIANT_CLASS;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "h-9 rounded-lg px-4 text-sm font-medium font-body transition-colors",
          VARIANT_CLASS[variant],
          className
        )}
      >
        {children}
      </button>
      <ShowcaseLeadModal
        target={open ? target : null}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
