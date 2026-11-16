import type { Output } from "@sandworm/types";

// One notebook cell's saved outputs, for the fixtures that show a cell
export const sampleCell: Output[] = [
  {
    type: "plotly",
    data: [
      {
        type: "bar",
        name: "Average fee (%)",
        x: ["Argentina", "Mexico", "Brazil", "Kenya", "Nigeria"],
        y: [2.2, 1.4, 1.1, 1.1, 0.9],
      },
    ],
    layout: { height: 320 },
  },
];
