import type { TeamClientSummary } from "./types";

export type ClientTypeFilter = "all" | TeamClientSummary["type"];

export function filterClients(
  clients: readonly TeamClientSummary[],
  { type, query }: { type: ClientTypeFilter; query: string }
): readonly TeamClientSummary[] {
  const needle = query.trim().toLowerCase();

  return clients.filter(client => {
    if (type !== "all" && client.type !== type) return false;
    if (!needle) return true;
    return [client.name, client.adminEmail ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });
}

export function countByType(
  clients: readonly TeamClientSummary[],
  type: ClientTypeFilter
): number {
  return type === "all"
    ? clients.length
    : clients.filter(client => client.type === type).length;
}

export function countByStatus(
  clients: readonly TeamClientSummary[],
  status: TeamClientSummary["status"]
): number {
  return clients.filter(client => client.status === status).length;
}
