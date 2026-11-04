import type { Output } from "@sandworm/types";

import { toId } from "@/lib/slug";
import type { BriefingItem } from "@/features/briefing/types";

export function briefingItem(init: Omit<BriefingItem, "id">): BriefingItem {
  return { ...init, id: toId(init.title) };
}

// Stand-ins for a notebook cell's saved outputs: a markdown title over a
// Plotly figure with no colours of its own, as sandworm_theme cells draw them.

export function markdown(text: string): Output {
  return { type: "markdown", text };
}

export function rankedBars(
  name: string,
  rows: readonly (readonly [label: string, value: number])[],
  suffix = "%"
): Output {
  const ordered = [...rows].reverse();
  return {
    type: "plotly",
    data: [
      {
        type: "bar",
        orientation: "h",
        name,
        y: ordered.map(([label]) => label),
        x: ordered.map(([, value]) => value),
        text: ordered.map(
          ([, value]) => `${value > 0 ? "+" : ""}${value}${suffix}`
        ),
        textposition: "outside",
        hovertemplate: `%{y}: %{x}${suffix}<extra></extra>`,
      },
    ],
    layout: {
      height: 260,
      showlegend: false,
      xaxis: { ticksuffix: suffix, zeroline: true },
    },
  };
}

export function line(
  name: string,
  points: readonly (readonly [label: string, value: number])[],
  prefix = ""
): Output {
  return {
    type: "plotly",
    data: [
      {
        type: "scatter",
        mode: "lines+markers",
        name,
        x: points.map(([label]) => label),
        y: points.map(([, value]) => value),
        hovertemplate: `%{x}: ${prefix}%{y}<extra></extra>`,
      },
    ],
    layout: { height: 280, showlegend: false, yaxis: { tickprefix: prefix } },
  };
}
