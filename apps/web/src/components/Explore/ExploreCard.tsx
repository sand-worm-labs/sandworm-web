"use client";

import { Star, GitFork } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@sandworm/ui/components/avatar";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStringQuery } from "../Editor/hooks/useQueryArgs";
import { useForkDocument } from "../Editor/hooks/usePublicDocuments";
import { useFavorites } from "../Editor/hooks/useFavorites";
import { cn } from "@/lib/utils";

import type { ApiDocument } from "@/types";

type ViewMode = "compact" | "detailed";

interface ExploreCardProps {
  query: ApiDocument;
  viewMode: ViewMode;
}

// =====================================
// ⬢ Explore Card
// =====================================
export const ExploreCard = ({ query, viewMode }: ExploreCardProps) => {
  const router = useRouter();
  const workspaceId = useStringQuery("workspace");

  const { forkDocument, loading: forking } = useForkDocument();

  const [favoritedIds, { favoriteDocument, unfavoriteDocument }] = useFavorites(
    workspaceId,
    true
  );

  const isFavorited = favoritedIds.has(query.id);

  // ⬢ Fork
  // =====================================
  const handleFork = async () => {
    if (!workspaceId) {
      toast.error("No workspace selected.");
      return;
    }

    const toastId = toast.loading("Forking document…");

    try {
      const forked = await forkDocument(query.id, workspaceId);

      console.log(query.id, workspaceId)

      console.log(forked, "forked")

      if (!forked?.id) throw new Error("Fork returned no document.");

      toast.success("Document forked!", { id: toastId });
      router.push(`/workspace/${workspaceId}/document/${forked.id}`);
    } catch (err) {
      toast.error("Failed to fork document. Please try again.", { id: toastId });
      console.error(err);
    }
  };

  // ⬢ Favorite
  // =====================================
  const handleFavorite = async () => {
    if (!workspaceId) {
      toast.error("No workspace selected.");
      return;
    }

    try {
      if (isFavorited) {
        await unfavoriteDocument(query.id);
        toast.success("Removed from favorites.");
      } else {
        await favoriteDocument(query.id);
        toast.success("Added to favorites.");
      }
    } catch {
      toast.error("Failed to update favorites. Please try again.");
    }
  };

  return (
    <div
      className={
        viewMode === "detailed"
          ? " "
          : "border-b border-[#E9ECEF] pb-3 transition-shadow mb-1 dark:border-border-tertiary"
      }
    >
      <div className="p-2 px-5">
        <div className="flex items-end justify-between gap-4">
          {/* ✦ Profile Info ✦ */}
          <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
            <div className="flex space-x-3 items-center">
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
              <div className="flex-1 min-w-0">
                <Link
                  href={`/workspace/${workspaceId}/profile/${query.authorId}`}
                  className="text-[0.8rem] mb-1 text-ink-400 hover:underline"
                >
                  @{query.author?.username}
                </Link>
                <h3 className="text-[0.95rem] font-medium truncate cursor-pointer hover:underline">
                  {query.title}
                </h3>
                <p className="text-xs text-ink-400">
                  Created{" "}
                  {query.createdAt
                    ? new Date(query.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* ✦ Actions + tags ✦ */}
          <div className="flex flex-col items-end gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm">
              <button
                onClick={handleFavorite}
                className="flex items-center gap-1 group"
                aria-label={isFavorited ? "Unfavorite" : "Favorite"}
              >
                <span>{query.favoriteCount}</span>
                <Star
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isFavorited
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-ink-300 dark:text-ink-300 group-hover:text-yellow-400"
                  )}
                  strokeWidth={1.2}
                />
              </button>

              <button
                onClick={handleFork}
                disabled={forking}
                className="flex items-center gap-1 group disabled:opacity-50"
                aria-label="Fork document"
              >
                <span>{query.forkCount}</span>
                <GitFork
                  className={cn(
                    "h-4 w-4 transition-colors text-ink-300 dark:text-ink-300",
                    !forking && "group-hover:text-blue-400"
                  )}
                  strokeWidth={1.2}
                />
              </button>
            </div>

            <div className="flex items-center gap-2" />
          </div>
        </div>
      </div>

      {viewMode === "detailed" && <div className="px-5 pb-4 text-sm" />}
    </div>
  );
}