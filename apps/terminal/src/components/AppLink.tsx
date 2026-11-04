import Link from "next/link";
import type { AriaRole, ReactNode } from "react";

import { ROUTES, type RouteId } from "@/config/routes";

type AppLinkProps = {
  route: RouteId;
  isCurrent?: boolean;
  isSelected?: boolean;
  role?: AriaRole;
  className?: string;
  children: ReactNode;
};

export function AppLink({
  route,
  isCurrent,
  isSelected,
  role,
  className,
  children,
}: AppLinkProps) {
  const { path, isBuilt } = ROUTES[route];

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
      href={path}
      role={role}
      aria-selected={isSelected}
      aria-current={isCurrent ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}
