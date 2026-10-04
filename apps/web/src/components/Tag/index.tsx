import { cn } from "@/lib/utils";

export const Tag = ({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) => (
  <span
    title={title}
    className={cn(
      "inline-flex items-center rounded-md px-2.5 py-1 text-[10.5px] leading-[14px] whitespace-nowrap",
      "font-body-mono font-normal text-ink-400 bg-base-600",
      className
    )}
  >
    {children}
  </span>
);
