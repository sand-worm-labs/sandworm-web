import { cn } from "@/lib/utils";

// =====================================
// ⬢ Shared skeleton primitive
// =====================================
export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md animate-pulse bg-black/5 dark:bg-white/10",
        className
      )}
    />
  );
}
