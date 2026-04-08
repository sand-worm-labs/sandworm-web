import { useState } from "react";

import { FeaturedExploreCard } from "./FeaturedExploreCard";

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
  };
  stars: number;
  forks: number;
}

// =====================================
// ⬢ Constants
// =====================================
const mockFeaturedQueries: FeaturedQuery[] = [
  {
    id: "popular_001",
    tag: "popular",
    title: "L2 Gas Consumption",
    createdAt: new Date("2025-05-30T09:00:00Z"),
    creator: {
      username: "base_gas_tracker",
      image: "/img/avatar/avatar1.svg",
    },
    stars: 59,
    forks: 143,
  },
  {
    id: "featured_001",
    tag: "featured",
    title: "Uniswap V3 LP Performance Tracker",
    createdAt: new Date("2025-01-02T08:00:00Z"),
    creator: {
      username: "defi_sage",
      image: "/img/avatar/avatar2.svg",
    },
    stars: 89,
    forks: 12,
  },
  {
    id: "featured_002",
    tag: "featured",
    title: "Cross-Chain Bridge Volume Analysis",
    createdAt: new Date("2025-01-10T11:30:00Z"),
    creator: {
      username: "bridge_watcher",
      image: "/img/avatar/avatar3.svg",
    },
    stars: 64,
    forks: 8,
  },
];

// =====================================
// ⬢ Featured Explore Section
// =====================================
export function FeaturedExploreSection() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleClick = (_id: string) => {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
      {mockFeaturedQueries.map(query => (
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
        />
      ))}
    </div>
  );
}
