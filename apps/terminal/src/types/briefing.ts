import type { Output } from "@sandworm/types";
import type { Tone } from "@sandworm/ui/kit/tone";

export type BriefingDetail = {
  headline?: {
    value: string;
    label: string;
    delta?: { text: string; tone: Tone };
  };
  // A snapshot of the source cell's outputs from the run the item was made
  // from: whatever the notebook drew (chart, table, card, markdown).
  outputs?: readonly Output[];
  what?: string;
  why?: string;
};
