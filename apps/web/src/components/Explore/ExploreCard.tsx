"use client";

import { Star, GitFork } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";

import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";
import { cn } from "@/lib/utils";
import type { ApiDocument } from "@/types";
import { formatDate } from "@/lib/date";
import { useModalStore } from "@/store/auth";

import { useSession } from "../Editor/hooks/useAuth";
import { useFavorites } from "../Editor/hooks/useFavorites";
import { useForkFlow } from "../Editor/PublicHeader/useForkFlow";
import { useStringQuery } from "../Editor/hooks/useQueryArgs";

// =====================================
// ⬢ Constants
// =====================================
const MAX_VISIBLE_TAGS = 4;

// =====================================
// ⬢ Types
// =====================================
interface ExploreCardProps {
  query: ApiDocument;
}

// =====================================
// ⬢ Component
// =====================================
export const ExploreCard = ({ query }: ExploreCardProps) => {
  const workspaceId = useStringQuery("workspace");

  const { user } = useSession({ redirectToLogin: false });
  const isOwnDocument = !!user && user.id === query.authorId;
  const openSignIn = useModalStore(state => state.openSignIn);

  const [, { favoriteDocument, unfavoriteDocument }] = useFavorites(
    workspaceId,
    true
  );

  const {
    triggerFork,
    isForkModalOpen,
    closeForkModal,
    handleFork,
    handleForkSuccess,
  } = useForkFlow({ id: query.id, title: query.title }, !!user);

  const [isFavorited, setIsFavorited] = useState(query.isFavorite ?? false);
  const [favoriteCount, setFavoriteCount] = useState(query.favoriteCount ?? 0);
  const formattedDate = formatDate(query.createdAt);

  const tags = query.tags ?? [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = tags.length - visibleTags.length;

  const handleFavorite = async () => {
    if (!user) {
      openSignIn();
      return;
    }
    const wasFavorited = isFavorited;
    setIsFavorited(!wasFavorited);
    setFavoriteCount(c => (wasFavorited ? c - 1 : c + 1));

    try {
      if (wasFavorited) {
        await unfavoriteDocument(query.id);
        toast.success("Removed from favorites.");
      } else {
        await favoriteDocument(query.id);
        toast.success("Added to favorites.");
      }
    } catch {
      setIsFavorited(wasFavorited);
      setFavoriteCount(c => (wasFavorited ? c + 1 : c - 1));
      toast.error("Failed to update favorites. Please try again.");
    }
  };

  // =====================================
  // ⬢ Render
  // =====================================
  return (
    <>
      <tr className="border-b border-border-secondary dark:border-border-tertiary last:border-b-0">
        <td className="p-4 align-top">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              {query.authorId ? (
                <AvatarImage src="/img/avatar.svg" />
              ) : (
                <AvatarFallback>
                  <Image
                    src="/img/avatar.svg"
                    alt="fallback avatar"
                    width={32}
                    height={32}
                  />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              {workspaceId ? (
                <Link
                  href={`/workspace/${workspaceId}/profile/${query.authorId}`}
                  className="text-sm font-medium text-ink-100 dark:text-white hover:underline block truncate"
                >
                  @{query.author?.username}
                </Link>
              ) : (
                <span className="text-sm font-medium text-ink-100 dark:text-white block truncate">
                  @{query.author?.username}
                </span>
              )}
              <p className="text-xs text-ink-400">Created {formattedDate}</p>
            </div>
          </div>
        </td>

        <td className="p-4 align-top max-w-xs">
          <Link
            href={`/notebooks/${query.slug ?? query.id}`}
            className="text-sm font-medium text-ink-100 dark:text-white hover:underline break-words"
          >
            {query.title}
          </Link>
        </td>

        <td className="p-4 align-top">
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
              {visibleTags.map(tag => (
                <span
                  key={tag}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-base-300 dark:bg-base-700 text-ink-400 whitespace-nowrap"
                >
                  #{tag}
                </span>
              ))}
              {hiddenTagCount > 0 && (
                <span className="text-[11px] text-ink-300 dark:text-ink-500">
                  +{hiddenTagCount}
                </span>
              )}
            </div>
          )}
        </td>

        <td className="p-4 align-top">
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={handleFavorite}
              className="flex items-center gap-1 -mx-2 -my-1 px-2 py-1 rounded-full border border-transparent group hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors"
              aria-label={isFavorited ? "Unfavorite" : "Favorite"}
            >
              <span className="text-sm">{favoriteCount}</span>
              <Star
                className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorited
                    ? "fill-primary text-primary"
                    : "text-ink-300 dark:text-ink-300 group-hover:text-yellow-400"
                )}
                strokeWidth={1.2}
              />
            </button>

            {!isOwnDocument && (
              <button
                type="button"
                onClick={triggerFork}
                className="flex items-center gap-1 -mx-2 -my-1 px-2 py-1 rounded-full border border-transparent group hover:bg-hover-bg hover:border-hover-border dark:hover:bg-base-600 transition-colors"
                aria-label="Fork document"
              >
                <span className="text-sm">{query.forkCount}</span>
                <GitFork
                  className="h-4 w-4 transition-colors text-ink-300 dark:text-ink-300 group-hover:text-ink-500 dark:group-hover:text-ink-200"
                  strokeWidth={1.2}
                />
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Only mounted for signed-in users: the modal runs an authenticated
          workspaces query that anonymous visitors on /explore can't make. */}
      {user && (
        <ForkToWorkspaceModal
          isOpen={isForkModalOpen}
          onClose={closeForkModal}
          document={{ id: query.id, title: query.title }}
          onFork={handleFork}
          onForkSuccess={handleForkSuccess}
        />
      )}
    </>
  );
};
