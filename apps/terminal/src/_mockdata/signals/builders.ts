import { sampleCell } from "@/_mockdata/sample-cell";
import { toId } from "@/lib/slug";
import type { Signal } from "@/types";

export function signal(init: Omit<Signal, "id">): Signal {
  return { outputs: sampleCell, ...init, id: toId(init.title) };
}
