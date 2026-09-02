"use client";

import Link from "next/link";
import { PiInfo, PiBookOpen, PiGithubLogo } from "react-icons/pi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@sandworm/ui/components/dropdown-menu";

import { footerLinks } from "@/data/footerLinks";
import { socialLinks } from "@/data/socialLinks";

const DOCS_URL =
  footerLinks.find(link => link.label === "Docs")?.href ??
  "https://docs.sandwormlabs.xyz";

const GITHUB_URL =
  socialLinks.find(link => link.name === "GitHub")?.href ??
  "https://github.com/sand-worm-labs";

const ITEM_CLASS =
  "flex items-center gap-3 w-full px-3 py-1.5 rounded-[10px] border border-transparent text-sm font-medium text-ink-500 dark:text-white hover:bg-hover-bg hover:border-hover-border dark:hover:bg-dropdown-hover transition-colors";

export default function HelpDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Help and resources"
          className="flex items-center justify-center h-8 w-8 rounded-lg text-ink-400 hover:text-ink-100 dark:hover:text-white hover:bg-hover-bg dark:hover:bg-base-600 transition-colors"
        >
          <PiInfo size={18} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 rounded-2xl border border-border-secondary dark:border-border-tertiary dark:bg-dropdown-bg shadow-md p-2"
        align="end"
      >
        <Link
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={ITEM_CLASS}
        >
          <PiBookOpen
            size={16}
            className="text-ink-navy dark:text-placeholder-muted"
          />
          Documentation
        </Link>
        <Link
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={ITEM_CLASS}
        >
          <PiGithubLogo
            size={16}
            className="text-ink-navy dark:text-placeholder-muted"
          />
          GitHub
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
