import type { BountyDetails } from "./bounties";

const PROMPT_DETAILS_CHARS = 2500;

const section = (
  title: string,
  items: string[] | string | null | undefined
) => {
  const body = Array.isArray(items)
    ? items.map(item => `- ${item}`).join("\n")
    : items?.trim();
  return body ? `\n## ${title}\n${body}\n` : "";
};

export const bountyStarterPrompt = (bounty: BountyDetails) =>
  [
    `I just started the bounty "${bounty.title}" (sponsored by ${bounty.sponsor}).`,
    "Build me a starter notebook for it in this notebook.",
    "Open with a markdown cell that restates the brief, then add a SQL or Python cell for each question below, and a chart where one helps. Run what you add and fix any errors. Do not invent figures.",
    section("Summary", bounty.summary),
    section("Details", bounty.details?.slice(0, PROMPT_DETAILS_CHARS)),
    section("Background", bounty.background),
    section("What to answer", bounty.requirements),
    section("What to submit", bounty.deliverables),
    section("How it is judged", bounty.judging),
    section("Data hints", bounty.dataHints),
  ]
    .filter(Boolean)
    .join("\n");
