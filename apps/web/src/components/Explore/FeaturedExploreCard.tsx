"use client";

import { Star, GitFork, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useStringQuery } from "../Editor/hooks/useQueryArgs";
import { useForkDocument } from "../Editor/hooks/usePublicDocuments";
import { useFavorites } from "../Editor/hooks/useFavorites";
import { ForkToWorkspaceModal } from "@/components/Explore/ForkToWorkspaceModal";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";


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
  isSaved?: boolean;      
  isFavorited?: boolean; 
  onSave?: (id: string) => void;
  onClick?: (id: string) => void;
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
  isFavorited: initialIsFavorited = false,
  onClick,
}: FeaturedExploreCardProps) {
  const router = useRouter();
  const workspaceId = useStringQuery("workspace");
  
  const { forkDocument, loading: forking } = useForkDocument();
  const [, { favoriteDocument, unfavoriteDocument }] = useFavorites(workspaceId, true);

  const [isForkModalOpen, setIsForkModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [favoriteCount, setFavoriteCount] = useState(stars);


  const formattedDate = formatDate(createdAt)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    const wasFavorited = isFavorited;
    
    setIsFavorited(!wasFavorited);
    setFavoriteCount((prev) => (wasFavorited ? prev - 1 : prev + 1));

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
      setFavoriteCount((prev) => (wasFavorited ? prev + 1 : prev - 1));
      toast.error("Failed to update favorites.");
    }
  };

  const handleForkClick = (e: React.MouseEvent) => {
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
        onClick={() => onClick?.(id)}
        className="bg-[#F2F3FB] dark:bg-base-100 rounded-2xl py-6 border border-border-secondary dark:border-border-tertiary p-4 cursor-pointer transition-shadow font-body group/card hover:shadow-md"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.(id)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-menu-ink bg-[#CDCDE2] px-2 py-1 rounded-md">
              {tagLabels[tag]}
            </span>
            <span className="text-xs text-ink-400">Created {formattedDate}</span>
          </div>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="text-ink-400 hover:text-menu-ink transition-colors"
          >
            <Bookmark
              size={18}
              className={isFavorited ? "fill-current text-menu-ink" : ""}
            />
          </button>
        </div>

        <h3 className="font-medium text-lg text-ink-100 mb-3">{title}</h3>

        <div className="flex items-center gap-2 mb-3">
          <Image
            src={creator.image || "/img/avatar.svg"}
            alt={creator.username}
            width={24}
            height={24}
            className="rounded-full"
          />
          <Link
            href={`/workspace/${workspaceId}/profile/${creator.userId}`}
            onClick={(e) => e.stopPropagation()} 
            className="text-sm text-ink-400 hover:underline"
          >
            @{creator.username}
          </Link>
        </div>

        <div className="flex items-center gap-4 text-sm text-ink-400">
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="flex items-center gap-1 group/btn transition-colors hover:text-yellow-500"
          >
            <Star
              size={14}
              className={cn(isFavorited && "fill-yellow-500 text-yellow-500")}
            />
            <span>{favoriteCount}</span>
          </button>

          {/* Fork Button */}
          <button
            onClick={handleForkClick}
            disabled={forking}
            className="flex items-center gap-1 group/btn transition-colors hover:text-blue-500 disabled:opacity-50"
          >
            <GitFork size={14} />
            <span>{forks}</span>
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