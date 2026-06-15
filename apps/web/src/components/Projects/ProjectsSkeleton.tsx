"use client";

import { Shimmer } from "@/components/Skeletons";

// =====================================
// ⬢ Project Card Skeleton
// =====================================
const CARD_TITLE_WIDTHS = [
  "w-36",
  "w-44",
  "w-28",
  "w-40",
  "w-32",
  "w-48",
] as const;

function ProjectCardSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="rounded-3xl border border-border-tertiary bg-base-100 p-4 py-3 flex flex-col">
      {/* title + action icons */}
      <div className="flex items-start justify-between mb-4">
        <Shimmer className={`h-4 ${titleWidth}`} />
        <div className="flex items-center gap-2">
          <Shimmer className="h-4 w-4 rounded-md" />
          <Shimmer className="h-4 w-4 rounded-md" />
        </div>
      </div>

      {/* preview area */}
      <Shimmer className="h-10 w-full rounded-lg mb-4" />

      {/* footer */}
      <div className="flex items-center justify-between mt-auto">
        <Shimmer className="h-6 w-6 rounded-md" />
        <Shimmer className="h-6 w-6 rounded-md" />
      </div>
    </div>
  );
}

// =====================================
// ⬢ Projects Grid Skeleton
// =====================================
export function ProjectsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-busy="true"
      aria-label="Loading projects"
    >
      {CARD_TITLE_WIDTHS.slice(0, count).map((w, i) => (
        <ProjectCardSkeleton key={i} titleWidth={w} />
      ))}
    </div>
  );
}

// =====================================
// ⬢ Projects Page Skeleton (header + grid)
// =====================================
export function ProjectsPageSkeleton() {
  return (
    <div className="min-h-screen dark:bg-base-200 p-8">
      {/* page header */}
      <div className="flex justify-between w-full container mx-auto mb-6">
        <div className="flex items-center gap-3">
          <Shimmer className="h-8 w-8 rounded-full" />
          <Shimmer className="h-5 w-24" />
        </div>
        <Shimmer className="h-10 w-36 rounded-xl mt-6" />
      </div>

      {/* controls bar */}
      <div className="mx-auto container mb-6">
        <div className="flex items-center gap-3">
          <Shimmer className="h-9 flex-1 max-w-xs rounded-xl" />
          <Shimmer className="h-9 w-24 rounded-xl" />
          <Shimmer className="h-9 w-24 rounded-xl" />
          <Shimmer className="h-9 w-20 rounded-xl ml-auto" />
        </div>
      </div>

      <div className="mx-auto container">
        <ProjectsGridSkeleton />
      </div>
    </div>
  );
}
