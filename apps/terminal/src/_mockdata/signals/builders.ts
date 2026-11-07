import { toId } from "@/lib/slug";
import type { Signal } from "@/features/signals/types";

export function signal(init: Omit<Signal, "id">): Signal {
  return { ...init, id: toId(init.title) };
}
