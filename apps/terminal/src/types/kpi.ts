import type { Tone } from "@sandworm/ui/kit/tone";

export type Kpi = {
  id: string;
  label: string;
  value: string;
  delta?: { text: string; tone: Tone };
  comparison?: string;
};
