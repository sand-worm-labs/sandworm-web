import clsx from "clsx";
import { useEffect, useMemo } from "react";

import useResettableState from "../hooks/useResettableState";

// =====================================
// ⬢  Constants
// =====================================
const TIMEOUT_TO_SHOW = 200;

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
        className={clsx("h-3.5 bg-[#F3F4F7] rounded-full", width)}
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
  const [show, setShow] = useResettableState(() => false, [visible]);

  useEffect(() => {
    if (!visible) return () => {};
    const t = setTimeout(() => setShow(true), TIMEOUT_TO_SHOW);
    return () => clearTimeout(t);
  }, [visible, setShow]);

  if (!visible || !show) return null;

  return (
    <div className="animate-pulse w-full h-24 bg-[#F3F4F7] rounded-lg mb-4" />
  );
}

// =====================================
// ⬢  Content Skeleton
// =====================================
export function ContentSkeleton({ visible }: Props) {
  const [show, setShow] = useResettableState(() => false, [visible]);

  useEffect(() => {
    if (!visible) return () => {};
    const t = setTimeout(() => setShow(true), TIMEOUT_TO_SHOW);
    return () => clearTimeout(t);
  }, [visible, setShow]);

  const rows = useMemo(() => {
    const ROW_HEIGHT = 22;
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;
    const rowsNeeded = Math.ceil(viewportHeight / ROW_HEIGHT) * 2;

    return Array.from({ length: rowsNeeded }).map((_, i) => {
      const { key, widths } =
        rowPatterns[i % rowPatterns.length] ?? rowPatterns[0]!;
      return (
        <SkeletonRow
          key={`${key}-${Math.floor(i / rowPatterns.length)}`}
          pattern={widths}
        />
      );
    });
  }, []);

  if (!visible || !show) return null;

  return (
    <div className="relative w-full min-h-[100dvh] p-6">
      <div
        className="
          animate-pulse
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-x-8
          gap-y-3
        "
      >
        {rows}
      </div>
    </div>
  );
}
