import { cn } from "@sandworm/ui/lib/utils";

export function BarLoader({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "h-1 w-[200px] rounded-[2px] bg-rainbow-bar bg-[length:200%_100%] motion-safe:animate-shift-colors",
        className
      )}
    />
  );
}
