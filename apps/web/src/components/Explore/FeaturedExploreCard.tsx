import { Star, GitFork, Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useStringQuery } from "../Editor/hooks/useQueryArgs";

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
  };
  stars: number;
  forks: number;
  isSaved?: boolean;
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
  isSaved = false,
  onSave,
  onClick,
}: FeaturedExploreCardProps) {
  const formattedDate = createdAt.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
  const workspaceId = useStringQuery("workspace");

  return (
    <div
      onClick={() => onClick?.(id)}
      className="bg-[#F2F3FB] dark:bg-base-100  rounded-2xl py-6 border border-border-secondary dark:border-border-tertiary p-4 cursor-pointer  transition-shadow font-body"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.(id);
        }
      }}
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
          onClick={e => {
            e.stopPropagation();
            onSave?.(id);
          }}
          className="text-ink-400 hover:text-menu-ink transition-colors"
        >
          <Bookmark
            size={18}
            className={isSaved ? "fill-current text-menu-ink" : ""}
          />
        </button>
      </div>

      <h3 className="font-medium text-lg text-ink-100 mb-3">{title}</h3>

      <div className="flex items-center gap-2 mb-3">
        <Image
          src={creator.image}
          alt={creator.username}
          width={24}
          height={24}
          className=" rounded-full"
        />
        <Link href={`/workspace/${workspaceId }/profile/${creator.username}`} className="text-sm text-ink-400 hover:text-underline">@{creator.username}</Link >
      </div>

      <div className="flex items-center gap-4 text-sm text-ink-400">
        <div className="flex items-center gap-1">
          <Star size={14} />
          <span>{stars}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork size={14} />
          <span>{forks}</span>
        </div>
      </div>
    </div>
  );
}
