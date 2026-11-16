import { describe, expect, it } from "vitest";

import type { PlotlyFigure } from "@sandworm/ui/lib/plotly-figure";
import {
  tileTopMargin,
  withSandwormDefaults as apply,
} from "@sandworm/ui/lib/plotly-defaults";

// Fixtures are partial figures, so the checks read them untyped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withSandwormDefaults = (figure: unknown): any =>
  apply(figure as PlotlyFigure);

const pxArea = {
  data: [
    {
      type: "scatter",
      name: "ZC",
      x: ["2026-07-12", "2026-07-13"],
      y: [457716, 450000],
      hovertemplate: "day=%{x}<br>token=ZC<br>value_usd=%{y}<extra></extra>",
    },
  ],
  layout: {
    title: { text: "Balance history" },
    margin: { t: 56, b: 8 },
    legend: { orientation: "h", y: -0.15, title: { text: "Token" } },
  },
};

describe("withSandwormDefaults", () => {
  it("moves a legend that sits under the plot back above it and clears its title", () => {
    const { layout } = withSandwormDefaults(pxArea);
    expect(layout.legend.y).toBe(1.02);
    expect(layout.legend.yanchor).toBe("bottom");
    expect(layout.legend.title.text).toBe("");
    expect(layout.margin.t).toBeGreaterThanOrEqual(104);
  });

  it("leaves a legend that is already above the plot where it is", () => {
    const fig = {
      data: [{ type: "bar", x: [1], y: [2] }],
      layout: { legend: { orientation: "h", y: 1.02, x: 0.5 } },
    };
    const { layout } = withSandwormDefaults(fig);
    expect(layout.legend.x).toBe(0.5);
    expect(layout.legend.y).toBe(1.02);
  });

  it("replaces Plotly Express tooltips with a muted label over a large value", () => {
    const { data, layout } = withSandwormDefaults(pxArea);
    expect(data[0].hovertemplate).toContain("%{x} · ZC");
    expect(data[0].hovertemplate).toContain("%{y}");
    expect(data[0].hovertemplate).not.toContain("day=");
    expect(layout.hovermode).toBeUndefined();
  });

  it("shows one tooltip for the hovered x when there are several series", () => {
    const fig = {
      data: [
        {
          type: "bar",
          name: "A",
          x: [1],
          y: [2],
          hovertemplate: "=%{y}<extra></extra>",
        },
        {
          type: "bar",
          name: "B",
          x: [1],
          y: [3],
          hovertemplate: "=%{y}<extra></extra>",
        },
      ],
      layout: {},
    };
    const { data, layout } = withSandwormDefaults(fig);
    expect(layout.hovermode).toBe("x unified");
    expect(data[0].hovertemplate).toBe(
      "<b>%{y}</b><extra>%{fullData.name}</extra>"
    );
  });

  it("stacks bars that Plotly Express put in separate offset groups", () => {
    const bars = (barmode: string) => ({
      data: ["A", "B"].map(name => ({
        type: "bar",
        name,
        x: [1],
        y: [2],
        offsetgroup: name,
      })),
      layout: { barmode },
    });
    expect(
      withSandwormDefaults(bars("relative")).data[0].offsetgroup
    ).toBeUndefined();
    expect(
      withSandwormDefaults(bars("stack")).data[1].offsetgroup
    ).toBeUndefined();
    expect(withSandwormDefaults(bars("group")).data[0].offsetgroup).toBe("A");
  });

  it("keeps the hover mode a notebook chose, and horizontal bars as they are", () => {
    const chosen = {
      data: [
        { type: "bar", name: "A", x: [1], y: [2] },
        { type: "bar", name: "B", x: [1], y: [3] },
      ],
      layout: { hovermode: "closest" },
    };
    expect(withSandwormDefaults(chosen).layout.hovermode).toBe("closest");
    const horizontal = {
      data: chosen.data.map(t => ({ ...t, orientation: "h" })),
      layout: {},
    };
    expect(withSandwormDefaults(horizontal).layout.hovermode).toBeUndefined();
  });

  it("keeps a tooltip the notebook wrote itself", () => {
    const own = "%{customdata[0]:.1%}<extra></extra>";
    const fig = {
      data: [{ type: "bar", hovertemplate: own, customdata: [[0.1]] }],
      layout: {},
    };
    expect(withSandwormDefaults(fig).data[0].hovertemplate).toBe(own);
  });

  it("rounds bars, tightens treemaps and shows whole numbers for big values", () => {
    const fig = {
      data: [
        { type: "bar", x: ["a"], y: [5000] },
        { type: "treemap", labels: ["a"], parents: [""] },
      ],
      layout: {},
    };
    const out = withSandwormDefaults(fig);
    expect(out.layout.barcornerradius).toBe(6);
    expect(out.layout.yaxis.hoverformat).toBe(",.0f");
    expect(out.data[1].tiling.pad).toBe(1);
    expect(out.data[1].marker.cornerradius).toBe(8);
    expect(out.data[1].marker.line.width).toBe(1);
    expect(out.data[1].pathbar.visible).toBe(false);
  });

  it("does not override what the notebook set, and is idempotent", () => {
    const fig = {
      data: [
        { type: "treemap", tiling: { pad: 3 }, marker: { cornerradius: 2 } },
      ],
      layout: { barcornerradius: 0, hoverlabel: { bgcolor: "#123456" } },
    };
    const once = withSandwormDefaults(fig);
    expect(once.data[0].tiling.pad).toBe(3);
    expect(once.data[0].marker.cornerradius).toBe(2);
    expect(once.layout.barcornerradius).toBe(0);
    expect(once.layout.hoverlabel.bordercolor).toBe("#123456");
    expect(withSandwormDefaults(once)).toEqual(once);
  });
});

describe("tileTopMargin", () => {
  const bars = (names: (string | undefined)[]) =>
    names.map(name => ({ type: "bar", name, x: [1], y: [1] }));

  it("keeps a compact margin for one untitled series", () => {
    expect(tileTopMargin({}, bars([undefined]))).toBe(24);
    expect(tileTopMargin({ title: { text: "Won 62%" } }, bars(["A"]))).toBe(48);
  });

  it("leaves room for the legend Plotly draws for two named series", () => {
    const layout = { title: { text: "Biggest counterparty" } };
    expect(tileTopMargin(layout, bars(["In", "Out"]))).toBeGreaterThanOrEqual(
      104
    );
    expect(tileTopMargin({}, bars(["In", "Out"]))).toBeGreaterThanOrEqual(56);
  });

  it("does not reserve room when the legend is off", () => {
    const layout = { showlegend: false, title: "Holdings" };
    expect(tileTopMargin(layout, bars(["In", "Out"]))).toBe(48);
  });
});

describe("heatmap colour scale", () => {
  it("gives a heatmap with no scale of its own the theme's pink-to-plum scale", () => {
    const { data } = withSandwormDefaults({
      data: [{ type: "heatmap", z: [[1, 2]] }],
      layout: {},
    });
    expect(data[0].colorscale[0]).toEqual([0, "#FDE7F4"]);
    expect(data[0].colorscale[2]).toEqual([1, "#4B2E83"]);
  });

  it("keeps a scale the notebook chose, and leaves coloraxis figures alone", () => {
    const own = [
      [0, "#000000"],
      [1, "#ffffff"],
    ];
    expect(
      withSandwormDefaults({
        data: [{ type: "heatmap", colorscale: own }],
        layout: {},
      }).data[0].colorscale
    ).toBe(own);
    expect(
      withSandwormDefaults({
        data: [{ type: "heatmap", coloraxis: "coloraxis" }],
        layout: {},
      }).data[0].colorscale
    ).toBeUndefined();
  });
});
