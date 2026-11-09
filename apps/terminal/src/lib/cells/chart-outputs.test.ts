import type { Output } from "@sandworm/types";
import { describe, expect, it } from "vitest";

import { toNativeChart } from "./chart-outputs";

const head = (title: string, keys = "") =>
  `<style>.sw{}</style><div class="sw"><div class="sw-chart-head"><h4 class="sw-chart-title">${title}</h4><div class="sw-legend">${keys}</div></div></div>`;
const key = (name: string, color: string, line = "") =>
  `<span><i class="${line}" style="background:${color}"></i>${name}</span>`;

const figure = (type = "bar", extra = {}): Output =>
  ({
    type: "plotly",
    data: [{ type, name: "A", x: [1], y: [2] }],
    layout: { showlegend: false, ...extra },
  }) as Output;

const html = (value: string): Output => ({ type: "html", html: value });

describe("toNativeChart", () => {
  it("reads the title and legend from the chart head and keeps the figure", () => {
    const chart = toNativeChart([
      html(
        head(
          "Naira &amp; USDC",
          key("P2P.me", "#EE149E", "ln") + key("Paycrest", "#84185C", "ln")
        )
      ),
      figure("scatter"),
    ]);

    expect(chart?.title).toBe("Naira & USDC");
    expect(chart?.legend).toEqual([
      { name: "P2P.me", color: "#EE149E", isLine: true },
      { name: "Paycrest", color: "#84185C", isLine: true },
    ]);
    expect(chart?.figure.data[0]?.type).toBe("scatter");
  });

  it("takes a swatch for a bar series and a line for a line series", () => {
    const chart = toNativeChart([
      html(head("T", key("Bars", "#A308F0"))),
      figure(),
    ]);
    expect(chart?.legend[0]?.isLine).toBe(false);
  });

  it("ignores the source note and printed text", () => {
    const outputs: Output[] = [
      html(head("T")),
      figure(),
      html('<div class="sw"><div class="sw-note">Source: Dune</div></div>'),
      { type: "stdio", name: "stdout", text: "hello" },
    ];
    expect(toNativeChart(outputs)?.title).toBe("T");
  });

  it("draws a figure on its own, with no head", () => {
    expect(toNativeChart([figure()])).toMatchObject({ title: "", legend: [] });
  });

  it("leaves a cell with other HTML to the notebook's renderer", () => {
    expect(toNativeChart([html("<div>stat cards</div>"), figure()])).toBeNull();
  });

  it("leaves a cell with no figure, or two, to the notebook's renderer", () => {
    expect(toNativeChart([html(head("T"))])).toBeNull();
    expect(toNativeChart([figure(), figure()])).toBeNull();
  });

  it("leaves other outputs, such as an error or a table, to the notebook's renderer", () => {
    const error = {
      type: "error",
      ename: "E",
      evalue: "v",
      traceback: [],
    } as unknown as Output;
    expect(toNativeChart([error, figure()])).toBeNull();
  });

  it("leaves figures the bundle or the tile cannot draw to the notebook's renderer", () => {
    expect(toNativeChart([figure("treemap")])).toBeNull();
    expect(toNativeChart([figure("bar", { updatemenus: [{}] })])).toBeNull();
    expect(toNativeChart([figure("bar", { sliders: [{}] })])).toBeNull();
  });

  it("does not trust a legend colour that is not a colour", () => {
    expect(
      toNativeChart([html(head("T", key("A", "red;x:y"))), figure()])
    ).toBeNull();
  });
});
