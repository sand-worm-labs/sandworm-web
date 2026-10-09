import { describe, expect, it } from "vitest";

import { toDarkFigure } from "./plotlyDark";

const figure = {
  data: [
    { type: "bar", marker: { color: "#EE149E" }, x: [1, 2], y: [3, 4] },
    { type: "scatter", line: { color: "#84185C" } },
    {
      type: "treemap",
      textfont: { color: "#FFFFFF" },
      marker: { line: { color: "#FFFFFF", width: 1 } },
    },
  ],
  layout: {
    font: { color: "#17101C" },
    yaxis: { gridcolor: "#E9E2ED", tickfont: { color: "#6F6478" } },
    hoverlabel: { bgcolor: "#1B1320", font: { color: "#FFFFFF", size: 13 } },
    template: { layout: { hoverlabel: { bgcolor: "#17101C" } } },
  },
};

describe("toDarkFigure", () => {
  const dark = toDarkFigure(figure);

  it("swaps the theme's text, rule and muted colors", () => {
    expect(dark.layout.font.color).toBe("#f3f0f5");
    expect(dark.layout.yaxis.gridcolor).toBe("#40403e");
    expect(dark.layout.yaxis.tickfont.color).toBe("#a5a5a4");
  });

  it("brightens the series colors that are too dark, and keeps the rest", () => {
    expect(dark.data[0].marker.color).toBe("#EE149E");
    expect(dark.data[1].line.color).toBe("#c1428a");
  });

  it("keeps white text on a colored fill white, but darkens separator lines", () => {
    expect(dark.data[2].textfont.color).toBe("#FFFFFF");
    expect(dark.data[2].marker.line.color).toBe("#272726");
  });

  it("shows tooltips as a light box with dark text", () => {
    expect(dark.layout.hoverlabel).toMatchObject({
      bgcolor: "#f3f0f5",
      font: { color: "#272726", size: 13 },
    });
    expect(dark.layout.template.layout.hoverlabel.bgcolor).toBe("#f3f0f5");
  });

  it("does not change the stored figure", () => {
    expect(figure.layout.font.color).toBe("#17101C");
    expect(figure.data[1].line.color).toBe("#84185C");
  });
});
