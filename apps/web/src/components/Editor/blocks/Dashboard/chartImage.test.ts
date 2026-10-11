import { describe, expect, it } from "vitest";

import { fileNameFor, parseChartText } from "./chartImage";

const head =
  '<div class="sw-chart-head"><h4 class="sw-chart-title">ZC is 36% of $1.06M</h4>' +
  '<div class="sw-legend"><span><i class="" style="background:#EE149E"></i>ZC</span>' +
  '<span><i class="ln" style="background:#84185C"></i>WHITE</span></div></div>';
const note = '<div class="sw-note">Source: Nansen, all chains.</div>';

describe("parseChartText", () => {
  it("reads the title, legend and source the theme's chart() drew as HTML", () => {
    const text = parseChartText(
      [
        { type: "html", html: head },
        { type: "plotly", layout: { title: "ignored" } },
        { type: "html", html: note },
      ],
      "Holdings"
    );
    expect(text.title).toBe("ZC is 36% of $1.06M");
    expect(text.source).toBe("Source: Nansen, all chains.");
    expect(text.legend).toEqual([
      { name: "ZC", color: "rgb(238, 20, 158)" },
      { name: "WHITE", color: "rgb(132, 24, 92)" },
    ]);
  });

  it("falls back to the figure's own title, then to the block's title", () => {
    const withLayout = parseChartText(
      [{ type: "plotly", layout: { title: { text: "From the figure" } } }],
      "Block"
    );
    expect(withLayout.title).toBe("From the figure");
    expect(
      parseChartText([{ type: "plotly", layout: {} }], " Block title ").title
    ).toBe("Block title");
  });

  it("returns no legend or source when the outputs have none", () => {
    const text = parseChartText([{ type: "plotly", layout: {} }], "T");
    expect(text.legend).toEqual([]);
    expect(text.source).toBe("");
  });
});

describe("fileNameFor", () => {
  it("makes a safe file name from a title", () => {
    expect(fileNameFor("ZC is 36% of $1.06M")).toBe("zc-is-36-of-1-06m.png");
    expect(fileNameFor("   ")).toBe("chart.png");
  });
});
