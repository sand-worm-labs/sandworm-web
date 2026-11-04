import type { BlockTag } from "../types";

type BlockAbout = { cadence: string; description: string };

export const BLOCK_ABOUT: Partial<Record<BlockTag, BlockAbout>> = {
  kpis: {
    cadence: "Daily",
    description: "Your headline numbers, checked before they go live.",
  },
  briefing: {
    cadence: "Every visit",
    description:
      "New analysis, new signals and big moves in your numbers since you last looked.",
  },
  signals: {
    cadence: "Weekly",
    description:
      "Markets to enter, partners to approach and products your users want, ranked by value.",
  },
  concentration: {
    cadence: "Daily",
    description: "How much of your activity depends on a small group.",
  },
  destinations: {
    cadence: "Daily",
    description: "Where your users or funds go next.",
  },
  gaps: {
    cadence: "Weekly",
    description: "Things your users do somewhere else that you could offer.",
  },
};
