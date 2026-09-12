"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Tag as TagIcon, ArrowLeft } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import dayjs from "dayjs";
import { toast } from "sonner";

import type { ApiDocument } from "@/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { tintPillDarkClassName } from "@/styles/interactive";
import { useModalStore } from "@/store/auth";

import { useCurrentWorkspaceInfo } from "../hooks/useWorkspaces";
import { useFavorites } from "../hooks/useFavorites";

import ForkButton from "./ForkButton";

interface NotebookHeroTopProps {
  document: ApiDocument | null;
  isAuthenticated: boolean;
  isOwnDocument: boolean;
}

export function NotebookHeroTop({
  document,
  isAuthenticated,
  isOwnDocument,
}: NotebookHeroTopProps) {
  const { workspaceInfo } = useCurrentWorkspaceInfo(!isAuthenticated);
  const exploreHref = workspaceInfo?.id
    ? `/workspace/${workspaceInfo.id}/explore`
    : "/workspace";

  const openSignIn = useModalStore(state => state.openSignIn);
  const [, { favoriteDocument, unfavoriteDocument }] = useFavorites(null, true);

  const [isFavorited, setIsFavorited] = useState(document?.isFavorite ?? false);
  const [favoriteCount, setFavoriteCount] = useState(
    document?.favoriteCount ?? 0
  );
  const updatedAt = document?.updatedAt ?? new Date();

  useEffect(() => {
    setIsFavorited(document?.isFavorite ?? false);
    setFavoriteCount(document?.favoriteCount ?? 0);
  }, [document?.isFavorite, document?.favoriteCount]);

  const handleFavorite = useCallback(async () => {
    if (!document) return;
    if (!isAuthenticated) {
      openSignIn();
      return;
    }

    const wasFavorited = isFavorited;
    setIsFavorited(!wasFavorited);
    setFavoriteCount(c => (wasFavorited ? c - 1 : c + 1));

    try {
      if (wasFavorited) {
        await unfavoriteDocument(document.id);
        toast.success("Removed from favorites.");
      } else {
        await favoriteDocument(document.id);
        toast.success("Added to favorites.");
      }
    } catch {
      setIsFavorited(wasFavorited);
      setFavoriteCount(c => (wasFavorited ? c + 1 : c - 1));
      toast.error("Failed to update favorites. Please try again.");
    }
  }, [
    document,
    isAuthenticated,
    isFavorited,
    favoriteDocument,
    unfavoriteDocument,
    openSignIn,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={exploreHref}
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
            onClick={handleFavorite}
            aria-label={isFavorited ? "Unfavorite" : "Favorite"}
            className="flex items-center gap-1.5 -mx-2 -my-1 px-2 py-1 rounded-full border border-transparent group hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors"
          >
            <Star
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorited
                  ? "fill-primary text-primary"
                  : "text-ink-400 group-hover:text-yellow-400"
              )}
              strokeWidth={1.2}
            />
            <span className="text-sm text-ink-400">{favoriteCount}</span>
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
  isAuthenticated: boolean;
}

export function NotebookHeroMeta({
  document,
  isAuthenticated,
}: NotebookHeroMetaProps) {
  const { workspaceInfo } = useCurrentWorkspaceInfo(!isAuthenticated);
  const createdAt = document?.createdAt ?? new Date();
  const author = document?.author;
  const authorName =
    [author?.firstName, author?.lastName].filter(Boolean).join(" ") ||
    (author?.username ? `@${author.username}` : "Sandworm");
  const tags = document?.tags ?? [];

  return (
    <div className="flex flex-col gap-4 pb-6">
      {document?.description && (
        <p className="text-lg font-normal text-ink-400 dark:text-ink-300 max-w-2xl">
          {document.description}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={author?.avater ?? undefined} alt={authorName} />
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
          href={`/workspace/${workspaceInfo?.id ?? ""}/profile/${document?.authorId ?? ""}`}
          className="text-sm font-normal text-ink-100 dark:text-ink-200 hover:text-primary transition-colors"
        >
          {authorName}
        </Link>
        <span className="text-sm text-ink-400">/</span>
        <span className="text-sm text-ink-400">
          {dayjs(createdAt).format("MMMM D, YYYY")}
        </span>
      </div>

      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <TagIcon
            className="h-4 w-4 text-ink-400 shrink-0"
            strokeWidth={1.5}
          />
          {tags.map(tag => (
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
      )}
    </div>
  );
}
