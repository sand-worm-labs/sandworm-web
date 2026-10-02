import type React from "react";
import { cn } from "@/lib/utils";

// =====================================
// ⬢ Shared skeleton primitive
// =====================================
export function Shimmer({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-md animate-pulse bg-black/5 dark:bg-white/10",
        className
      )}
    />
  );
}
