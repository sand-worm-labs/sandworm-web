import { describe, expect, it } from "vitest";

import {
  StreamRenderer,
  formatTick,
  isStreamFigure,
  niceStep,
  parseStreamFigure,
  typicalInterval,
} from "./streamChart";

const NOW = 1_800_000_000_000;

// One point a second for `seconds` seconds, ending at NOW.
function figure(seconds: number, kind = "line", names: string[] = ["a"]) {
  const x = Array.from(
    { length: seconds },
    (_, i) => NOW - (seconds - 1 - i) * 1000
  );
  return {
    data: names.map((name, k) => ({
      type: kind === "bars" ? "bar" : "scatter",
      name,
      x,
      y: x.map((_, i) => 100 + i + k * 10),
    })),
    layout: {
      title: { text: "Price" },
      meta: { sandworm: "stream", kind, window: null },
    },
  };
}

// Records what a renderer draws, standing in for a canvas.
function fakeContext() {
  const calls: { name: string; args: any[] }[] = [];
  const record =
    (name: string) =>
    (...args: any[]) => {
      calls.push({ name, args });
    };
  const ctx = {
    setTransform: record("setTransform"),
    clearRect: record("clearRect"),
    beginPath: record("beginPath"),
    closePath: record("closePath"),
    moveTo: record("moveTo"),
    lineTo: record("lineTo"),
    stroke: record("stroke"),
    fill: record("fill"),
    fillRect: record("fillRect"),
    fillText: record("fillText"),
    rect: record("rect"),
    clip: record("clip"),
    save: record("save"),
    restore: record("restore"),
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

const count = (calls: { name: string }[], name: string) =>
  calls.filter(c => c.name === name).length;

describe("stream figures", () => {
  it("are recognised by their marker, and nothing else is", () => {
    expect(isStreamFigure(figure(10))).toBe(true);
    expect(isStreamFigure({ data: [], layout: { title: "x" } })).toBe(false);
    expect(isStreamFigure({ data: [] })).toBe(false);
  });

  it("parse times given as numbers or ISO strings", () => {
    const parsed = parseStreamFigure(
      {
        data: [{ x: [NOW, new Date(NOW + 1000).toISOString()], y: [1, 2] }],
        layout: { meta: { sandworm: "stream", kind: "area", window: 30 } },
      },
      false
    );
    expect(Array.from(parsed.series[0]!.x)).toEqual([NOW, NOW + 1000]);
    expect(parsed.kind).toBe("area");
    expect(parsed.windowMs).toBe(30000);
  });

  it("read the usual gap between points", () => {
    const parsed = parseStreamFigure(figure(20), false);
    expect(typicalInterval(parsed.series[0]!.x)).toBe(1000);
  });
});

describe("axis labels", () => {
  it("use round steps", () => {
    expect(niceStep(100, 4)).toBe(50);
    expect(niceStep(7, 4)).toBe(2);
    expect(niceStep(0.0004, 4)).toBe(0.0001);
  });

  it("keep enough digits to tell neighbouring ticks apart", () => {
    expect(formatTick(64980, 20, 65000)).toBe("64.98k");
    expect(formatTick(1_500_000, 500_000, 2_000_000)).toBe("1.5M");
    expect(formatTick(42, 10, 80)).toBe("42");
    expect(formatTick(0.00001002, 1e-8, 0.0000101)).toBe("0.00001002");
  });
});

describe("the renderer", () => {
  function render(kind: string, names?: string[]) {
    const { ctx, calls } = fakeContext();
    const renderer = new StreamRenderer(ctx);
    renderer.setFigure(parseStreamFigure(figure(60, kind, names), false));
    renderer.resize(800, 260, 2);
    renderer.draw(NOW, 16);
    return { renderer, calls };
  }

  it("draws a line through the points in view", () => {
    const { calls } = render("line");
    expect(count(calls, "moveTo")).toBeGreaterThan(0);
    expect(count(calls, "lineTo")).toBeGreaterThan(40);
    expect(count(calls, "fillText")).toBeGreaterThan(4);
  });

  it("stacks several series of bars", () => {
    const { calls } = render("bars", ["buys", "sells"]);
    const bars = calls.filter(c => c.name === "fillRect");
    expect(bars.length).toBeGreaterThan(80);
    // The second series of each pair sits on top of the first.
    const [first, second] = bars;
    expect(second!.args[1]! + second!.args[3]!).toBeCloseTo(first!.args[1]!, 5);
  });

  // Where a moment in time sits in the latest frame, read off its time label:
  // labels are drawn at round clock times and scroll with the data.
  const pad = (n: number) => String(n).padStart(2, "0");
  function labelX(calls: { name: string; args: unknown[] }[], ms: number) {
    const d = new Date(ms);
    const text = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const frame = calls.map(c => c.name).lastIndexOf("setTransform");
    const label = calls
      .slice(frame)
      .find(c => c.name === "fillText" && c.args[0] === text);
    return label!.args[1] as number;
  }
  const MARK = NOW - 30000;

  it("scrolls between updates, without new data", () => {
    const { renderer, calls } = render("line");
    const before = labelX(calls, MARK);
    // Half a second later, same data: everything has moved left.
    for (let t = 8; t <= 500; t += 8) renderer.draw(NOW + t, 8);
    const moved = before - labelX(calls, MARK);
    // About 13 pixels a second at this size.
    expect(moved).toBeGreaterThan(3);
    expect(moved).toBeLessThan(7);
  });

  it("moves the same small amount on every frame, not in steps", () => {
    const { renderer, calls } = render("line");
    for (let t = 8; t <= 700; t += 8) renderer.draw(NOW + t, 8);
    const positions: number[] = [];
    for (let t = 708; t <= 1100; t += 8) {
      renderer.draw(NOW + t, 8);
      positions.push(labelX(calls, MARK));
    }
    const moves = positions.slice(1).map((x, i) => positions[i]! - x);
    expect(Math.min(...moves)).toBeGreaterThan(0.09);
    expect(Math.max(...moves) - Math.min(...moves)).toBeLessThan(0.005);
  });

  it("stops scrolling when updates stop, rather than running off the data", () => {
    const { renderer, calls } = render("line");
    for (let t = 16; t <= 20000; t += 16) renderer.draw(NOW + t, 16);
    const settled = labelX(calls, MARK);
    renderer.draw(NOW + 30000, 16);
    expect(Math.abs(labelX(calls, MARK) - settled)).toBeLessThan(0.01);
  });

  it("draws nothing, and doesn't throw, with no data", () => {
    const { ctx, calls } = fakeContext();
    const renderer = new StreamRenderer(ctx);
    renderer.setFigure(
      parseStreamFigure(
        { data: [], layout: { meta: { sandworm: "stream" } } },
        false
      )
    );
    renderer.resize(400, 200, 1);
    renderer.draw(NOW, 16);
    expect(count(calls, "stroke")).toBe(0);
  });
});
