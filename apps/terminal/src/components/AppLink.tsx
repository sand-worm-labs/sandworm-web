import Link from "next/link";
import type { AriaRole, ReactNode } from "react";

import { routeHref, type RouteId } from "@/config/routes";

type AppLinkProps = {
  route: RouteId;
  // An entity page under the route, e.g. /analysis/project/<slug>
  slug?: string;
  // Search params, e.g. which item a list opens on
  query?: Record<string, string>;
  isCurrent?: boolean;
  isSelected?: boolean;
  role?: AriaRole;
  className?: string;
  children: ReactNode;
};

export function AppLink({
  route,
  slug,
  query,
  isCurrent,
  isSelected,
  role,
  className,
  children,
}: AppLinkProps) {
  const href = routeHref(route, query, slug);

  if (!href) {
    return (
      <span
        role={role}
        aria-selected={isSelected}
        aria-disabled="true"
        className={className}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      role={role}
      aria-selected={isSelected}
      aria-current={isCurrent ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}
