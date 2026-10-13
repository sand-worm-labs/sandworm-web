import clsx from "clsx";

// =====================================
// ⬢  Constants
// =====================================
// Enough rows to fill a tall screen. A fixed count keeps the server's HTML and the browser's first
// render identical.
const ROW_COUNT = 36;
// The same tokens as the other skeletons, so it follows light and dark mode.
const BLOCK = "bg-base-300 dark:bg-base-700";

const rowPatterns = [
  { key: "full-1", widths: ["w-full"] },
  { key: "3q-half", widths: ["w-3/4", "w-1/2"] },
  { key: "3rd-2q-1q", widths: ["w-1/3", "w-2/5", "w-1/4"] },
  { key: "full-2", widths: ["w-full"] },
  { key: "2q-3q", widths: ["w-2/3", "w-3/4"] },
  { key: "1q-half-3rd", widths: ["w-1/4", "w-1/2", "w-1/3"] },
  { key: "4q", widths: ["w-4/5"] },
  { key: "half-2q", widths: ["w-1/2", "w-2/3"] },
  { key: "2q-3q-half", widths: ["w-2/5", "w-3/5", "w-1/2"] },
  { key: "full-3", widths: ["w-full"] },
  { key: "3q-3rd", widths: ["w-3/4", "w-1/3"] },
  { key: "3rd-2q-1q-b", widths: ["w-1/3", "w-2/5", "w-1/4"] },
] satisfies { key: string; widths: string[] }[];

const SkeletonRow = ({ pattern }: { pattern: string[] }) => (
  <div className="flex gap-3 w-full">
    {pattern.map(width => (
      <div
        key={width}
        className={clsx("h-[1.3rem] rounded-full", BLOCK, width)}
      />
    ))}
  </div>
);

interface Props {
  visible: boolean;
}

// =====================================
// ⬢  Tile Skeleton
// =====================================
export function TitleSkeleton({ visible }: Props) {
  if (!visible) return null;

  return (
    <div
      className={clsx(
        "skeleton-delayed animate-pulse w-full h-16 rounded-full mb-2 px-12",
        BLOCK
      )}
    />
  );
}

// =====================================
// ⬢  Content Skeleton
// =====================================
export function ContentSkeleton({ visible }: Props) {
  if (!visible) return null;

  return (
    <div className="skeleton-delayed relative w-full max-h-[100dvh] overflow-hidden p-6">
      <div className="animate-pulse grid grid-cols-1 gap-x-8 gap-y-3">
        {Array.from({ length: ROW_COUNT }).map((_, i) => {
          const { key, widths } =
            rowPatterns[i % rowPatterns.length] ?? rowPatterns[0]!;
          return (
            <SkeletonRow
              key={`${key}-${Math.floor(i / rowPatterns.length)}`}
              pattern={widths}
            />
          );
        })}
      </div>
    </div>
  );
}
