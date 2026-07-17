"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";

import { useStringQuery } from "../Editor/hooks/useQueryArgs";
import { useForkDocument } from "../Editor/hooks/usePublicDocuments";
import { useFavorites } from "../Editor/hooks/useFavorites";
import { BookmarkSimple } from "../Assets/BookmarkSimple";
import { GitFork } from "../Assets/GitFork";
import { Star } from "../Assets/Menu/Star";

// =====================================
// ⬢ Types
// =====================================
type CardTag = "featured" | "popular" | "trending" | "new";

interface FeaturedExploreCardProps {
  id: string;
  tag: CardTag;
  title: string;
  createdAt: Date;
  creator: {
    username: string;
    image: string;
    userId: string;
  };
  stars: number;
  forks: number;
  isFavorite?: boolean;
  variant?: "default" | "purple";
}

const tagLabels: Record<CardTag, string> = {
  featured: "Featured",
  popular: "Most Popular",
  trending: "Trending",
  new: "New",
};

// =====================================
// ⬢ Feature Explore Card
// =====================================
export function FeaturedExploreCard({
  id,
  tag,
  title,
  createdAt,
  creator,
  stars,
  forks,
  isFavorite,
  variant = "default",
}: FeaturedExploreCardProps) {
  const router = useRouter();
  const workspaceId = useStringQuery("workspace");
  const isPurple = variant === "purple";

  const { forkDocument, loading: forking } = useForkDocument();
  const [, { favoriteDocument, unfavoriteDocument }] = useFavorites(
    workspaceId,
    true
  );

  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(isFavorite ?? false);
  const [favoriteCount, setFavoriteCount] = useState(stars);

  const formattedDate = formatDate(createdAt);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFavorited = isFavorited;

    setIsFavorited(!wasFavorited);
    setFavoriteCount(prev => (wasFavorited ? prev - 1 : prev + 1));

    try {
      if (wasFavorited) {
        await unfavoriteDocument(id);
        toast.success("Removed from favorites.");
      } else {
        await favoriteDocument(id);
        toast.success("Added to favorites.");
      }
    } catch (err) {
      setIsFavorited(wasFavorited);
      setFavoriteCount(prev => (wasFavorited ? prev + 1 : prev - 1));
      toast.error("Failed to update favorites.");
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsForkModalOpen(true);
  };

  const handleFork = async ({
    documentId,
    workspaceId: targetWorkspaceId,
  }: {
    documentId: string;
    workspaceId: string;
  }) => {
    const forked = await forkDocument(documentId, targetWorkspaceId);
    if (!forked?.id) throw new Error("Fork failed");
  };

  const handleForkSuccess = (targetWorkspaceId: string) => {
    toast.success("Notebook forked!");
    router.push(`/workspace/${targetWorkspaceId}`);
  };

  return (
    <>
      <div
        onClick={() => router.push(`/p/${id}`)}
        className={cn(
          "flex flex-col rounded-3xl py-5 border px-6 cursor-pointer transition-shadow font-body group/card",
          isPurple
            ? "bg-primary border-teal/[20%] text-white"
            : "bg-[#F2F3FB] dark:bg-base-100 border-teal/[20%] dark:border-border-tertiary"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={e =>
          (e.key === "Enter" || e.key === " ") && router.push(`/p/${id}`)
        }
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-md",
                isPurple
                  ? "bg-[#F3F3FA] text-ink-400"
                  : "text-ink-400 bg-[#CDCDE2]"
              )}
            >
              {tagLabels[tag]}
            </span>
            <span
              className={cn(
                "text-xs",
                isPurple ? "text-inputBg" : "text-ink-400"
              )}
            >
              Created {formattedDate}
            </span>
          </div>
          {/* Save = fork to workspace */}
          <button
            type="button"
            onClick={handleSaveClick}
            aria-label="Save to workspace"
            className={cn(
              "transition-colors rounded-full w-6 h-6 flex justify-center items-center",
              isPurple
                ? "bg-[#F3F3FA] text-ink-400 hover:bg-[#AFA9EC]"
                : "text-ink-400 hover:text-menu-ink bg-[#CDCDE2]"
            )}
          >
            <BookmarkSimple
              className={cn(isPurple ? "text-ink-400" : "text-ink-navy")}
            />
          </button>
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-medium text-lg mb-3",
            isPurple ? "text-white" : "text-ink-100"
          )}
        >
          {title}
        </h3>

        {/* Creator */}
        <div className="flex items-center gap-1.5 mb-3">
          <Image
            src={creator.image || "/img/avatar.svg"}
            alt={creator?.username}
            width={30}
            height={30}
            className="rounded-full"
          />
          <Link
            href={`/workspace/${workspaceId}/profile/${creator.userId}`}
            onClick={e => e.stopPropagation()}
            className={cn(
              "text-sm font-medium hover:underline",
              isPurple ? "text-inputBg" : "text-ink-400"
            )}
          >
            @{creator?.username}
          </Link>
        </div>

        {/* ↓ mt-auto pushes this row to the bottom regardless of card height */}
        <div
          className={cn(
            "flex items-center gap-4 mt-auto pt-6 text-[15px] font-medium",
            isPurple ? "text-white" : "text-ink-100"
          )}
        >
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorited ? "Unfavorite" : "Favorite"}
            className={cn(
              "flex items-center gap-1 transition-colors",
              isPurple ? "hover:text-yellow-300" : "hover:text-yellow-500"
            )}
          >
            <span>{favoriteCount}</span>
            <Star
              size={18}
              className={cn(isFavorited && "fill-yellow-500 text-yellow-500")}
            />
          </button>

          <button
            type="button"
            onClick={handleSaveClick}
            disabled={forking}
            aria-label="Fork to workspace"
            className={cn(
              "flex items-center gap-1 transition-colors disabled:opacity-50",
              isPurple ? "hover:text-blue-300" : "hover:text-blue-500"
            )}
          >
            <span>{forks}</span>
            <GitFork size={18} />
          </button>
        </div>
      </div>

      <ForkToWorkspaceModal
        isOpen={isForkModalOpen}
        onClose={() => setIsForkModalOpen(false)}
        document={{ id, title }}
        onFork={handleFork}
        onForkSuccess={handleForkSuccess}
      />
    </>
  );
}
