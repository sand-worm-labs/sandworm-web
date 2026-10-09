"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
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
import { useModalStore } from "@/store/auth";
import { Tag } from "@/components/Tag";
import { Breadcrumb } from "@/components/Breadcrumb";
import { headerIconButtonClassName } from "@/styles/interactive";

import { useCurrentWorkspaceInfo } from "../hooks/useWorkspaces";
import { useFavorites } from "../hooks/useFavorites";
import { TooltipV2 } from "../blocks/ToolTips";

import ForkButton from "./ForkButton";

interface NotebookHeroTopProps {
  document: ApiDocument | null;
  isAuthenticated: boolean;
}

export function NotebookHeroTop({
  document,
  isAuthenticated,
}: NotebookHeroTopProps) {
  const { workspaceInfo } = useCurrentWorkspaceInfo(!isAuthenticated);
  const exploreHref = workspaceInfo?.id
    ? `/workspace/${workspaceInfo.id}/explore`
    : "/explore";
  const updatedAt = document?.updatedAt ?? new Date();

  const crumbs = [
    { label: "Explore", href: exploreHref },
    ...(document?.title ? [{ label: document.title }] : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Breadcrumb items={crumbs} />
        <span className="text-sm text-ink-400 hidden sm:inline shrink-0">
          Last edited {formatDate(updatedAt)}
        </span>
      </div>
    </div>
  );
}

interface NotebookActionsProps {
  document: ApiDocument | null;
  isAuthenticated: boolean;
  isOwnDocument: boolean;
}

export function NotebookActions({
  document,
  isAuthenticated,
  isOwnDocument,
}: NotebookActionsProps) {
  const openSignIn = useModalStore(state => state.openSignIn);
  const [, { favoriteDocument, unfavoriteDocument }] = useFavorites(null, true);

  const [isFavorited, setIsFavorited] = useState(document?.isFavorite ?? false);
  const [favoriteCount, setFavoriteCount] = useState(
    document?.favoriteCount ?? 0
  );

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
    <div className="flex shrink-0 items-center gap-1 -ml-2 sm:ml-0">
      <TooltipV2<HTMLButtonElement>
        title={isFavorited ? "Unfavorite" : "Favorite"}
        active
        position="bottom"
      >
        {ref => (
          <button
            ref={ref}
            type="button"
            onClick={handleFavorite}
            aria-label={isFavorited ? "Unfavorite" : "Favorite"}
            className={cn(headerIconButtonClassName, "h-8 gap-1.5 px-2")}
          >
            <Star
              className={cn(
                "h-[18px] w-[18px]",
                isFavorited && "fill-primary text-primary"
              )}
              strokeWidth={1.2}
            />
            <span className="text-sm">{favoriteCount}</span>
          </button>
        )}
      </TooltipV2>
      {!isOwnDocument && (
        <ForkButton
          document={document && { id: document.id, title: document.title }}
          isAuthenticated={isAuthenticated}
          variant="icon"
        />
      )}
    </div>
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
        <p className="font-report-prose text-[20px] leading-snug font-normal text-ink-400 dark:text-placeholder-muted max-w-2xl">
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
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map(tag => (
            <Tag key={tag}>#{tag}</Tag>
          ))}
        </div>
      )}
    </div>
  );
}
