import { useMemo } from "react";

import { usePublicDocuments } from "@/components/Editor/hooks/usePublicDocuments";
import type { ApiDocument } from "@/types";

import { FeaturedExploreCard } from "./FeaturedExploreCard";
import { FeaturedExploreSectionSkeleton } from "./ExploreSkeletons";

// =====================================
// ⬢ Types
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
// TODO(creator): resolve authorId → { username, avatar } via GetUser.
//                Do NOT do this per-card — batch it, or embed author on Document.
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
    isFavorite: doc.isFavorite,
  };
}

// =====================================
// ⬢ Main
// =====================================
export function FeaturedExploreSection() {
  const { featured, featuredLoading, featuredError } = usePublicDocuments();

  const queries = useMemo(() => featured.map(toFeaturedQuery), [featured]);

  if (featuredLoading && queries.length === 0) {
    return <FeaturedExploreSectionSkeleton />;
  }

  if (featuredError && queries.length === 0) {
    return (
      <div className="mb-12 text-sm text-red-600 dark:text-red-400">
        Couldn&apos;t load featured notebooks.
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
          isFavorite={query.isFavorite}
          variant={index === 0 ? "purple" : "default"}
        />
      ))}
    </div>
  );
}
