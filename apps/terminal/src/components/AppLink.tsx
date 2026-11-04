import Link from "next/link";
import type { AriaRole, ReactNode } from "react";

import { ROUTES, routePath, type RouteId } from "@/config/routes";

type AppLinkProps = {
  route: RouteId;
  slug?: string;
  isCurrent?: boolean;
  isSelected?: boolean;
  role?: AriaRole;
  className?: string;
  children: ReactNode;
};

export function AppLink({
  route,
  slug,
  isCurrent,
  isSelected,
  role,
  className,
  children,
}: AppLinkProps) {
  const { isBuilt } = ROUTES[route];

  if (!isBuilt) {
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
      href={routePath(route, slug)}
      role={role}
      aria-selected={isSelected}
      aria-current={isCurrent ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}
