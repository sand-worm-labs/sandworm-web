import clsx from "clsx";
import { useEffect, useMemo } from "react";

import useResettableState from "./hooks/useResettableState";

const TIMEOUT_TO_SHOW = 200;

const rowPatterns = [
  ["w-full"],
  ["w-3/4", "w-1/2"],
  ["w-1/3", "w-2/5", "w-1/4"],
  ["w-full"],
  ["w-2/3", "w-3/4"],
  ["w-1/4", "w-1/2", "w-1/3"],
  ["w-4/5"],
  ["w-1/2", "w-2/3"],
  ["w-2/5", "w-3/5", "w-1/2"],
  ["w-full"],
  ["w-3/4", "w-1/3"],
  ["w-1/3", "w-2/5", "w-1/4"],
];

const SkeletonRow = ({ pattern }: { pattern: string[] }) => {
  return (
    <div className="flex gap-3 w-full">
      {pattern.map((width, i) => (
        <div
          key={i}
          className={clsx("h-3.5 bg-[#F3F4F7]/80 rounded-full", width)}
        />
      ))}
    </div>
  );
};

interface Props {
  visible: boolean;
}

export function TitleSkeleton({ visible }: Props) {
  const [show, setShow] = useResettableState(() => false, [visible]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setShow(true), TIMEOUT_TO_SHOW);
    return () => clearTimeout(t);
  }, [visible, setShow]);

  if (!visible || !show) return null;

  return (
    <div className="animate-pulse w-full h-24 bg-[#F3F4F7] rounded-lg mb-4" />
  );
}

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
      const pattern = rowPatterns[i % rowPatterns.length];
      return <SkeletonRow key={i} pattern={pattern} />;
    });
  }, []);

  if (!visible || !show) return null;

  return (
    <div className="relative w-full min-h-[100dvh] p-6">
      {/* Skeleton grid */}
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
