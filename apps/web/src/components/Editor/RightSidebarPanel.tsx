"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@sandworm/ui/lib/utils";

// =====================================
// ⬢ Constants
// =====================================
const MIN_WIDTH = 300;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 380;

// =====================================
// ⬢ Props
// =====================================
interface Props {
  visible: boolean;
  children: React.ReactNode;
}

// =====================================
// ⬢ RightSidebarPanel
// =====================================
export function RightSidebarPanel({ visible, children }: Props) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    setIsResizing(true);

    function handleMouseMove(e: MouseEvent) {
      if (!isResizingRef.current) return;
      const newWidth = Math.max(
        MIN_WIDTH,
        Math.min(MAX_WIDTH, window.innerWidth - e.clientX)
      );
      setWidth(newWidth);
    }

    function handleMouseUp() {
      isResizingRef.current = false;
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div
      style={{ width: visible ? width : 0 }}
      className={cn(
        "h-full overflow-hidden flex-shrink-0 relative flex print:hidden dark:bg-page-surface",
        !isResizing && "transition-[width] duration-300 ease-in-out"
      )}
    >
      {visible && (
        <>
          {/* ─── Drag Handle ─── */}
          {/* Outer zone: wide enough to be hittable, cursor set here */}
          <div
            className="absolute left-0 top-0 h-full w-[12px] z-50 cursor-col-resize group flex items-center justify-center"
            onMouseDown={startResizing}
          >
            <div
              className={cn(
                "w-[1px] h-full transition-colors duration-150",
                isResizing
                  ? "bg-primary/60"
                  : "bg-border-secondary dark:bg-border-tertiary group-hover:bg-primary/30"
              )}
            />
          </div>
        </>
      )}

      <div className="flex-1 min-w-0 h-full pl-[12px]">{children}</div>
    </div>
  );
}
