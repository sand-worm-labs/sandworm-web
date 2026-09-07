"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Tag as TagIcon, BadgeCheck, ArrowLeft } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import dayjs from "dayjs";

import type { ApiDocument } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { tintPillDarkClassName } from "@/styles/interactive";

import { useStringQuery } from "../hooks/useQueryArgs";
import ForkButton from "./ForkButton";

// Placeholders until the notebook feed carries real category/tag data.
const DUMMY_CATEGORY = "Starter notebook";
const DUMMY_TAGS = ["Real-world assets (RWA)", "Yield farming", "DeFi"];

interface NotebookHeroTopProps {
  document: ApiDocument | null;
  isAuthenticated: boolean;
  isOwnDocument: boolean;
  backHref?: string;
}

export function NotebookHeroTop({
  document,
  isAuthenticated,
  isOwnDocument,
  backHref = "/explore",
}: NotebookHeroTopProps) {
  const favoriteCount = document?.favoriteCount ?? 24;
  const updatedAt = document?.updatedAt ?? new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="group inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-primary transition-colors w-fit"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5"
            strokeWidth={1.5}
          />
          Explore
        </Link>

        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1.5 -mx-2 -my-1 px-2 py-1 rounded-full border border-transparent text-sm text-ink-400 hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors"
          >
            <Star className="h-4 w-4" strokeWidth={1.2} />
            {favoriteCount}
          </button>
          <span className="text-sm text-ink-400 hidden sm:inline">
            Last edited {formatDate(updatedAt)}
          </span>
          {!isOwnDocument && (
            <ForkButton
              document={document && { id: document.id, title: document.title }}
              isAuthenticated={isAuthenticated}
              variant="hero"
            />
          )}
        </div>
      </div>

{/*       <SandwormDarkLogo style={{ width: 56, height: 56 }} />
 */}    </div>
  );
}

interface NotebookHeroMetaProps {
  document: ApiDocument | null;
}

export function NotebookHeroMeta({ document }: NotebookHeroMetaProps) {
  const workspaceId = useStringQuery("workspace");
  const createdAt = document?.createdAt ?? new Date();
  const author = document?.author;
  const authorName =
    [author?.firstName, author?.lastName].filter(Boolean).join(" ") ||
    (author?.username ? `@${author.username}` : "Sandworm");

  return (
    <div className="flex flex-col gap-4 pb-6">
      <p className="text-sm text-ink-400">
        {DUMMY_CATEGORY} | {dayjs(createdAt).format("MMMM D, YYYY")}
      </p>

      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src="/img/avatar.svg" />
          <AvatarFallback>
            <Image
              src="/img/avatar.svg"
              alt="author avatar"
              width={24}
              height={24}
            />
          </AvatarFallback>
        </Avatar>
        <Link
          href={`/workspace/${workspaceId}/profile/${document?.authorId ?? ""}`}
          className="text-sm font-medium text-ink-600 dark:text-ink-200 hover:text-primary transition-colors"
        >
          {authorName}
        </Link>
        <BadgeCheck
          className="h-4 w-4 text-primary"
          strokeWidth={1.5}
          aria-label="Verified"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <TagIcon className="h-4 w-4 text-ink-400 shrink-0" strokeWidth={1.5} />
        {DUMMY_TAGS.map(tag => (
          <span
            key={tag}
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full bg-base-300 text-ink-400 border border-transparent",
              tintPillDarkClassName
            )}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
