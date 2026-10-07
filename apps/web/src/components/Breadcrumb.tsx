import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

// =====================================
// ⬢ Breadcrumb
// =====================================
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-ink-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={item.href ?? item.label}
              className={cn(
                "flex items-center gap-1.5",
                isLast ? "min-w-0" : "shrink-0"
              )}
            >
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-ink-300"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  title={item.label}
                  className={cn(
                    "truncate",
                    isLast && "text-ink-100 dark:text-ink-200"
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
