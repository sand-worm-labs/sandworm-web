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
import { useState } from "react";

import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";
import { cn } from "@/lib/utils";
import type { ApiDocument } from "@/types";
import { formatDate } from "@/lib/date";

import { useSession } from "../Editor/hooks/useAuth";
import { useFavorites } from "../Editor/hooks/useFavorites";
import { useForkDocument } from "../Editor/hooks/usePublicDocuments";
import { useStringQuery } from "../Editor/hooks/useQueryArgs";

// =====================================
// ⬢ Types
// =====================================
type ViewMode = "compact" | "detailed";

interface ExploreCardProps {
  query: ApiDocument;
  viewMode: ViewMode;
}

// =====================================
// ⬢ Component
// =====================================
export const ExploreCard = ({ query, viewMode }: ExploreCardProps) => {
  const router = useRouter();
  const workspaceId = useStringQuery("workspace");

  const { user } = useSession({ redirectToLogin: false });
  const isOwnDocument = !!user && user.id === query.authorId;

  const { forkDocument, loading: forking } = useForkDocument();
  const [, { favoriteDocument, unfavoriteDocument }] = useFavorites(
    workspaceId,
    true
  );

  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(query.isFavorite ?? false);
  const [favoriteCount, setFavoriteCount] = useState(query.favoriteCount ?? 0);
  const formattedDate = formatDate(query.createdAt);

  const handleForkClick = () => setIsForkModalOpen(true);

  const handleFork = async ({
    documentId,
    workspaceId: targetWorkspaceId,
  }: {
    documentId: string;
    workspaceId: string;
  }) => {
    const forked = await forkDocument(documentId, targetWorkspaceId);
    if (!forked?.id) throw new Error("Fork returned no document.");
  };

  const handleForkSuccess = (targetWorkspaceId: string) => {
    toast.success("Notebook forked!");
    router.push(`/workspace/${targetWorkspaceId}`);
  };

  const handleFavorite = async () => {
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
      <div
        className={
          viewMode === "detailed"
            ? " "
            : "border-b border-border-secondary pb-3 transition-shadow mb-1 dark:border-border-tertiary"
        }
      >
        <div className="p-2 px-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div className="flex flex-col items-start gap-2 flex-1 min-w-0">
              <div className="flex space-x-3 items-center w-full">
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
                  <Link
                    href={`/notebooks/${query.slug ?? query.id}`}
                    className="text-[0.95rem] font-medium break-words cursor-pointer hover:underline block"
                  >
                    {query.title}
                  </Link>

                  <p className="text-xs text-ink-400">
                    Created {formattedDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm pl-11 sm:pl-0 flex-shrink-0">
              <button
                type="button"
                onClick={handleFavorite}
                className="flex items-center gap-1 group"
                aria-label={isFavorited ? "Unfavorite" : "Favorite"}
              >
                <span>{favoriteCount}</span>
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
                  onClick={handleForkClick}
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
              )}
            </div>
          </div>
        </div>

        {viewMode === "detailed" && <div className="px-5 pb-4 text-sm" />}
      </div>

      <ForkToWorkspaceModal
        isOpen={isForkModalOpen}
        onClose={() => setIsForkModalOpen(false)}
        document={{ id: query.id, title: query.title }}
        onFork={handleFork}
        onForkSuccess={handleForkSuccess}
      />
    </>
  );
};
