import type { GetBountiesQuery, GetBountyQuery } from "@/generated/graphql";

export type Bounty = GetBountiesQuery["getBounties"][number];
export type BountyDetails = NonNullable<GetBountyQuery["getBounty"]>;
export type BountyRef = Pick<Bounty, "slug" | "title" | "status" | "onchainId">;

export const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  open: "Open",
  judging: "Judging",
  closed: "Closed",
};

// The API caps a tag at 32 characters; a longer slug is cut and given a short
// hash so two long slugs never share a tag.
const MAX_TAG_LENGTH = 32;

export const bountyTag = (slug: string) => {
  const tag = `bounty-${slug}`;
  if (tag.length <= MAX_TAG_LENGTH) return tag;
  const hash = Array.from(slug).reduce(
    (acc, char) => (acc * 33 + char.charCodeAt(0)) % 2 ** 32,
    5381
  );
  const suffix = `-${hash.toString(36).padStart(6, "0").slice(-6)}`;
  return `${tag.slice(0, MAX_TAG_LENGTH - suffix.length)}${suffix}`;
};
