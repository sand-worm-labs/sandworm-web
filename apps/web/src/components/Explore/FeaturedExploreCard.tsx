import { Star, GitFork, Bookmark } from "lucide-react";

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

  return (
    <div
      onClick={() => onClick?.(id)}
      className="bg-[#F2F3FB] rounded-2xl py-6 border border-gray-200 p-4 cursor-pointer  transition-shadow font-body"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.(id);
        }
      }}
    >
      {/* Top row: tag + date + save icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 bg-[#CDCDE2] px-2 py-1 rounded-md">
            {tagLabels[tag]}
          </span>
          <span className="text-xs text-gray-400">Created {formattedDate}</span>
        </div>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onSave?.(id);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Bookmark
            size={18}
            className={isSaved ? "fill-current text-gray-600" : ""}
          />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-medium text-lg text-gray-900 mb-3">{title}</h3>

      {/* Creator row */}
      <div className="flex items-center gap-2 mb-3">
        <img
          src={creator.image}
          alt={creator.username}
          className="w-6 h-6 rounded-full"
        />
        <span className="text-sm text-gray-500">@{creator.username}</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
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
