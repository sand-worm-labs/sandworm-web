import { cn } from "@/lib/utils";

const FEATURED_SKELETON_KEYS = ["a", "b", "c", "d"] as const;
const LIST_SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const LOAD_MORE_SKELETON_KEYS = ["a", "b"] as const;

// =====================================
// ⬢ Shared
// =====================================
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md animate-pulse bg-black/5 dark:bg-white/10",
        className
      )}
    />
  );
}

// =====================================
// ⬢ Featured Explore Card Skeleton
// =====================================
interface FeaturedExploreCardSkeletonProps {
  variant?: "default" | "purple";
}

export function FeaturedExploreCardSkeleton({
  variant = "default",
}: FeaturedExploreCardSkeletonProps) {
  const isPurple = variant === "purple";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-col rounded-3xl py-5 border px-6 font-body",
        isPurple
          ? "bg-primary border-teal/[20%]"
          : "bg-[#F2F3FB] dark:bg-base-100 border-teal/[20%] dark:border-border-tertiary"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Shimmer
            className={cn(
              "h-5 w-16 rounded-md",
              isPurple ? "bg-white/20" : undefined
            )}
          />
          <Shimmer
            className={cn("h-3 w-24", isPurple ? "bg-white/15" : undefined)}
          />
        </div>
        <Shimmer
          className={cn(
            "h-6 w-6 rounded-full shrink-0",
            isPurple ? "bg-white/20" : undefined
          )}
        />
      </div>

      <Shimmer
        className={cn(
          "h-6 w-[80%] max-w-[280px] mb-3",
          isPurple ? "bg-white/25" : undefined
        )}
      />
      <Shimmer
        className={cn(
          "h-6 w-[60%] max-w-[200px] mb-3",
          isPurple ? "bg-white/20" : undefined
        )}
      />

      <div className="flex items-center gap-1.5 mb-3">
        <Shimmer
          className={cn(
            "h-[30px] w-[30px] rounded-full shrink-0",
            isPurple ? "bg-white/20" : undefined
          )}
        />
        <Shimmer
          className={cn("h-4 w-24", isPurple ? "bg-white/15" : undefined)}
        />
      </div>

      <div className="flex items-center gap-4 mt-auto pt-6">
        <Shimmer
          className={cn("h-5 w-12", isPurple ? "bg-white/20" : undefined)}
        />
        <Shimmer
          className={cn("h-5 w-12", isPurple ? "bg-white/15" : undefined)}
        />
      </div>
    </div>
  );
}

interface FeaturedExploreSectionSkeletonProps {
  count?: number;
}

export function FeaturedExploreSectionSkeleton({
  count = 4,
}: FeaturedExploreSectionSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
      aria-busy="true"
      aria-label="Loading featured notebooks"
    >
      {FEATURED_SKELETON_KEYS.slice(0, count).map((key, index) => (
        <FeaturedExploreCardSkeleton
          key={key}
          variant={index === 0 ? "purple" : "default"}
        />
      ))}
    </div>
  );
}

// =====================================
// ⬢ Explore Card Skeleton
// =====================================
export function ExploreCardSkeleton() {
  return (
    <tr
      aria-hidden="true"
      className="border-b border-border-secondary dark:border-border-tertiary last:border-b-0"
    >
      <td className="p-4 align-top">
        <div className="flex items-center gap-2.5">
          <Shimmer className="h-8 w-8 rounded-full shrink-0" />
          <div className="min-w-0 space-y-2">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-3 w-16" />
          </div>
        </div>
      </td>
      <td className="p-4 align-top">
        <Shimmer className="h-4 w-full max-w-[220px]" />
      </td>
      <td className="p-4 align-top">
        <div className="flex items-center gap-1.5">
          <Shimmer className="h-4 w-12 rounded-md" />
          <Shimmer className="h-4 w-12 rounded-md" />
        </div>
      </td>
      <td className="p-4 align-top">
        <div className="flex items-center gap-3 justify-end">
          <Shimmer className="h-4 w-10" />
          <Shimmer className="h-4 w-10" />
        </div>
      </td>
    </tr>
  );
}

interface ExploreListSkeletonProps {
  count?: number;
}

export function ExploreListSkeleton({ count = 8 }: ExploreListSkeletonProps) {
  return (
    <div
      className="mb-16 h-full justify-between flex flex-col"
      aria-busy="true"
      aria-label="Loading queries"
    >
      <div className="mb-8 my-6 overflow-x-auto border border-border-secondary dark:border-border-tertiary rounded-xl">
        <table className="w-full border-collapse">
          <tbody>
            {LIST_SKELETON_KEYS.slice(0, count).map(key => (
              <ExploreCardSkeleton key={key} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ExploreListLoadMoreSkeletonProps {
  count?: number;
}

export function ExploreListLoadMoreSkeleton({
  count = 2,
}: ExploreListLoadMoreSkeletonProps) {
  // No wrapping element — these rows are spliced directly into the real
  // table's <tbody> (see QueryList), which sets aria-busy/aria-label itself
  // while loadingMore is true.
  return (
    <>
      {LOAD_MORE_SKELETON_KEYS.slice(0, count).map(key => (
        <ExploreCardSkeleton key={key} />
      ))}
    </>
  );
}
