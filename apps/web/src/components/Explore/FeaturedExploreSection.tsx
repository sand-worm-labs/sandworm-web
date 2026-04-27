import { useMemo, useState } from "react";

import { usePublicDocuments } from "@/components/Editor/hooks/usePublicDocuments";
import type { ApiDocument } from "@/types";

import { FeaturedExploreCard } from "./FeaturedExploreCard";

// =====================================
// ⬢ Constants
// =====================================
type CardTag = "featured" | "popular" | "trending" | "new";

interface FeaturedQuery {
  id: string;
  tag: CardTag;
  title: string;
  createdAt: Date;
  creator: {
    username: string;
    image: string;
    userId: string;
  };
  isFavorite?: boolean;
  stars: number;
  forks: number;
}

// =====================================
// ⬢ Constants
// =====================================
const PLACEHOLDER_AVATAR = "/img/avatar/avatar1.svg";

// Map ApiDocument → card props.
// TODO(creator): resolve authorId → { username, avater } via GetUser.
//                Do NOT do this per-card — batch it, or embed author on Document.
// TODO(stars|forks): wire once backend ships them. 0 is a lie.
// TODO(tag): everything from getFeaturedDocuments is "featured" by definition.
//            Other tags need backend support (separate query or Document.tag field).
function toFeaturedQuery(doc: ApiDocument): FeaturedQuery {
  return {
    id: doc.id,
    tag: "featured",
    title: doc.title || "Untitled",
    createdAt: new Date(doc.createdAt),
    creator: {
      username: doc?.author?.username,
      image: PLACEHOLDER_AVATAR,
      userId: doc.authorId,
    },
    stars: doc.favoriteCount,
    forks: doc.forkCount,
    isFavorite: doc.isFavorite
  };
}

// =====================================
// ⬢ Main
// =====================================
export function FeaturedExploreSection() {
  const { featured, featuredLoading, featuredError } = usePublicDocuments();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const queries = useMemo(() => featured.map(toFeaturedQuery), [featured]);

  const handleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClick = (_id: string) => { };

  console.log(queries);

  if (featuredLoading && queries.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (featuredError && queries.length === 0) {
    return (
      <div className="mb-12 text-sm text-red-600 dark:text-red-400">
        Couldn’t load featured notebooks.
      </div>
    );
  }

  if (queries.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {queries.map((query, index) => (
        <FeaturedExploreCard
          key={query.id}
          id={query.id}
          tag={query.tag}
          title={query.title}
          createdAt={query.createdAt}
          creator={query.creator}
          stars={query.stars}
          forks={query.forks}
          isSaved={savedIds.has(query.id)}
          onSave={handleSave}
          onClick={handleClick}
          isFavorite={query.isFavorite}
          variant={index === 0 ? "purple" : "default"} 
        />
      ))}
    </div>
  );
}
