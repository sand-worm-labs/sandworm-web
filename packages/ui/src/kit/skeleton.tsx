import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx("block animate-pulse rounded-md bg-hover-bg", className)}
    />
  );
}
