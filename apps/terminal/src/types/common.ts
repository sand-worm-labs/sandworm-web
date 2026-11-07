import type { ReactNode } from "react";

import type { RouteId } from "@/config/routes";

export type ChildrenProps = { children: ReactNode };

// A button or link that takes the reader to another page. `url` opens the source in
// the web app (a report's notebook) instead of a terminal route.
export type Action = { label: string; route: RouteId; url?: string };
