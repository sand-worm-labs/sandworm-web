import type { ReactNode } from "react";

import type { RouteId } from "@/config/routes";

export type ChildrenProps = { children: ReactNode };

// A button or link that takes the reader to another page of the app.
export type Action = { label: string; route: RouteId };
