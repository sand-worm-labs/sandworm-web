import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { cn } from "@/lib/utils";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchField = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: SearchFieldProps) => (
  <div className={cn("relative", className)}>
    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
    <input
      type="text"
      aria-label={placeholder}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-52 pl-10 pr-4 py-1 h-8 rounded-lg border border-transparent dark:border-border-tertiary dark:bg-base-400 dark:text-white placeholder:dark:text-placeholder-muted focus:outline-none focus:ring focus:ring-primary transition text-xs md:text-sm bg-base-600 placeholder:text-ink-300"
    />
  </div>
);
