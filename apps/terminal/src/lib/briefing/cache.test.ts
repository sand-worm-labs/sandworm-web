import type { ApolloCache } from "@apollo/client";
import { describe, expect, it, vi } from "vitest";

import type { TerminalBriefingQuery } from "@/generated/graphql";

import { patchBriefingItems, stampBriefingSeen } from "./cache";

const item = (id: string) => ({
  __typename: "TerminalBriefingItem" as const,
  id,
  kind: "metric",
  title: id,
  summary: "",
  subject: "",
  detail: {},
  publishedAt: "2026-11-09T10:00:00.000Z",
  isRead: false,
  isArchived: false,
  sourcePath: null,
});

const stored: TerminalBriefingQuery = {
  terminalBriefing: {
    __typename: "TerminalBriefing",
    lastSeenAt: "2026-11-01T00:00:00.000Z",
    archivedCount: 0,
    items: [item("a"), item("b")],
  },
};

// Runs the update a cache call was given against the stored briefing
function applied(run: (cache: ApolloCache<unknown>) => void) {
  const updateQuery = vi.fn(
    (_options: unknown, update: (data: TerminalBriefingQuery) => unknown) =>
      update(stored)
  );
  run({ updateQuery } as unknown as ApolloCache<unknown>);
  return updateQuery.mock.results[0]?.value as TerminalBriefingQuery;
}

describe("briefing cache", () => {
  it("changes only the items named", () => {
    const { terminalBriefing } = applied(cache =>
      patchBriefingItems(cache, ["a"], { isRead: true, isArchived: true })
    );

    expect(terminalBriefing.items[0]).toMatchObject({
      isRead: true,
      isArchived: true,
    });
    expect(terminalBriefing.items[1]).toMatchObject({
      isRead: false,
      isArchived: false,
    });
  });

  it("starts the next visit from the moment given", () => {
    const { terminalBriefing } = applied(cache =>
      stampBriefingSeen(cache, new Date("2026-11-09T12:00:00.000Z"))
    );

    expect(terminalBriefing.lastSeenAt).toBe("2026-11-09T12:00:00.000Z");
    expect(terminalBriefing.items).toHaveLength(2);
  });
});
