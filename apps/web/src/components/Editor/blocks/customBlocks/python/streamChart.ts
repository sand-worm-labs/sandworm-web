// =====================================
// ⬢ Stream chart
// =====================================
// What sandworm.stream() draws: a time series on a canvas that scrolls
// continuously, redrawn on every animation frame, so it moves at the screen's
// refresh rate however rarely new data arrives.
//
// The figure itself is an ordinary Plotly figure with a marker in layout.meta
// (see sandworm.stream in src/lib/pyodide/harness.ts). Anything that doesn't
// know the marker (a PDF, an image export, an older client) still draws it as
// a static Plotly chart.

export type StreamKind = "line" | "area" | "bars";

export type StreamSeries = {
  name: string | null;
  // Times, in milliseconds since the epoch, ascending.
  x: Float64Array;
  y: Float64Array;
  color: string;
};

export type StreamFigure = {
  title: string;
  kind: StreamKind;
  series: StreamSeries[];
  // How much time the chart shows; null to show what the data covers.
  windowMs: number | null;
  height: number | null;
};

type FigureLike = { data?: unknown; layout?: any };

// The theme's series colors and neutrals (public/sandworm_theme/tokens.py),
// with the dark counterparts the web app swaps in.
const SERIES_LIGHT = [
  "#EE149E",
  "#84185C",
  "#FB51BD",
  "#FE83D1",
  "#A308F0",
  "#C77DEB",
  "#4B2E83",
  "#6F6478",
];
const SERIES_DARK = [
  "#EE149E",
  "#C1428A",
  "#FB51BD",
  "#FE83D1",
  "#A308F0",
  "#C77DEB",
  "#9A7BDB",
  "#A5A5A4",
];
const LIGHT = { ink: "#17101C", muted: "#6F6478", rule: "#E9E2ED" };
const DARK = { ink: "#F3F0F5", muted: "#A5A5A4", rule: "#40403E" };
export const streamColors = (isDark: boolean) => (isDark ? DARK : LIGHT);

export const STREAM_FONT =
  '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif';

export function isStreamFigure(figure: FigureLike): boolean {
  return figure.layout?.meta?.sandworm === "stream";
}

function toMs(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Date.parse(value);
  return NaN;
}

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : NaN;
}

export function parseStreamFigure(
  figure: FigureLike,
  isDark: boolean
): StreamFigure {
  const palette = isDark ? SERIES_DARK : SERIES_LIGHT;
  const meta = figure.layout?.meta ?? {};
  const traces = Array.isArray(figure.data) ? figure.data : [];
  const kind: StreamKind =
    meta.kind === "area" || meta.kind === "bars" ? meta.kind : "line";

  const series = traces.map((trace: any, i: number): StreamSeries => {
    const xs: unknown[] = Array.isArray(trace?.x) ? trace.x : [];
    const ys: unknown[] = Array.isArray(trace?.y) ? trace.y : [];
    const length = Math.min(xs.length, ys.length);
    const x = new Float64Array(length);
    const y = new Float64Array(length);
    for (let j = 0; j < length; j += 1) {
      x[j] = toMs(xs[j]);
      y[j] = toNumber(ys[j]);
    }
    return {
      name: typeof trace?.name === "string" ? trace.name : null,
      x,
      y,
      color: palette[i % palette.length] as string,
    };
  });

  const title = figure.layout?.title;
  const windowSeconds = Number(meta.window);
  return {
    title: typeof title === "string" ? title : (title?.text ?? ""),
    kind,
    series,
    windowMs: windowSeconds > 0 ? windowSeconds * 1000 : null,
    height:
      typeof figure.layout?.height === "number" ? figure.layout.height : null,
  };
}

// First index whose value is not below `target`.
function lowerBound(values: Float64Array, target: number): number {
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1; // eslint-disable-line no-bitwise
    if ((values[mid] as number) < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// The usual gap between points: the median of the latest few.
export function typicalInterval(x: Float64Array): number {
  const gaps: number[] = [];
  for (let i = Math.max(1, x.length - 9); i < x.length; i += 1) {
    const gap = (x[i] as number) - (x[i - 1] as number);
    if (gap > 0) gaps.push(gap);
  }
  if (gaps.length === 0) return 1000;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)] as number;
}

// A round step (1, 2 or 5 times a power of ten) giving about `count` ticks.
export function niceStep(range: number, count: number): number {
  if (!(range > 0)) return 1;
  const raw = range / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const scaled = raw / power;
  if (scaled <= 1) return power;
  if (scaled <= 2) return 2 * power;
  if (scaled <= 5) return 5 * power;
  return 10 * power;
}

const UNITS: [number, string][] = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "k"],
];

// Axis labels short enough for the margin: 64.98k, 1.2M, 0.00001002.
export function formatTick(value: number, step: number, maxAbs: number) {
  const unit = UNITS.find(([size]) => maxAbs >= size);
  const size = unit ? unit[0] : 1;
  const scaledStep = step / size;
  const decimals =
    scaledStep >= 1
      ? 0
      : Math.min(10, Math.max(0, Math.ceil(-Math.log10(scaledStep) - 1e-9)));
  return (value / size).toFixed(decimals) + (unit ? unit[1] : "");
}

const TIME_STEPS_S = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function formatTime(ms: number, stepS: number): string {
  const d = new Date(ms);
  const base = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return stepS >= 60 ? base : `${base}:${pad(d.getSeconds())}`;
}

// How quickly the view catches up with where it should be, in milliseconds.
// Small enough to track new data closely, large enough to hide the jitter in
// when updates arrive.
const SCROLL_EASE_MS = 120;
const SCALE_EASE_MS = 250;

const MARGIN = { left: 56, right: 12, top: 8, bottom: 22 };

// Draws one stream chart. Holds the little state that makes it smooth: where
// the view is and what the y scale is, both eased towards where the data says
// they should be.
export class StreamRenderer {
  private figure: StreamFigure | null = null;

  private interval = 1000;

  private width = 0;

  private height = 0;

  private dpr = 1;

  private viewRight: number | null = null;

  private windowMs: number | null = null;

  private yLo: number | null = null;

  private yHi: number | null = null;

  private isDark = false;

  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setFigure(figure: StreamFigure) {
    this.figure = figure;
    const first = figure.series[0];
    this.interval = first ? typicalInterval(first.x) : 1000;
  }

  setTheme(isDark: boolean) {
    this.isDark = isDark;
  }

  resize(width: number, height: number, dpr: number) {
    this.width = width;
    this.height = height;
    this.dpr = dpr;
  }

  // `now` is the wall-clock time of this frame and `dt` the time since the
  // last one, both in milliseconds.
  draw(now: number, dt: number) {
    const { ctx, figure, width, height } = this;
    if (!figure || width <= 0 || height <= 0) return;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const series = figure.series.filter(s => s.x.length > 0);
    if (series.length === 0) return;

    let firstX = Infinity;
    let lastX = -Infinity;
    series.forEach(s => {
      firstX = Math.min(firstX, s.x[0] as number);
      lastX = Math.max(lastX, s.x[s.x.length - 1] as number);
    });

    // The view ends a little behind the clock: far enough that the next point
    // has always arrived before the view reaches it, so the line scrolls in
    // rather than popping in. It never runs past the newest point; if updates
    // stop, the chart stops.
    const delay = this.interval * 1.15 + 50;
    const target = Math.min(now - delay, lastX);
    if (this.viewRight === null || Math.abs(target - this.viewRight) > 10000) {
      this.viewRight = target;
    } else {
      this.viewRight +=
        (target - this.viewRight) * (1 - Math.exp(-dt / SCROLL_EASE_MS));
    }
    const right = this.viewRight;
    // While a rolling series is still filling up, the time it covers grows
    // with every update; ease that too, or the chart would zoom in steps.
    const targetWindow =
      figure.windowMs ??
      Math.max(lastX - firstX - 2 * this.interval, 5 * this.interval);
    if (this.windowMs === null) {
      this.windowMs = targetWindow;
    } else {
      this.windowMs +=
        (targetWindow - this.windowMs) * (1 - Math.exp(-dt / SCALE_EASE_MS));
    }
    const { windowMs } = this;
    const left = right - windowMs;

    const plotLeft = MARGIN.left;
    const plotRight = width - MARGIN.right;
    const plotTop = MARGIN.top;
    const plotBottom = height - MARGIN.bottom;
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;
    if (plotWidth <= 0 || plotHeight <= 0) return;

    const stacked = figure.kind === "bars" && series.length > 1;
    const fromZero = figure.kind !== "line";

    // The y scale follows what's in view.
    let lo = Infinity;
    let hi = -Infinity;
    const base = series[0] as StreamSeries;
    const start = Math.max(0, lowerBound(base.x, left - this.interval) - 1);
    const end = Math.min(
      base.x.length,
      lowerBound(base.x, right + this.interval) + 1
    );
    if (stacked) {
      for (let i = start; i < end; i += 1) {
        let total = 0;
        for (let k = 0; k < series.length; k += 1) {
          const v = (series[k] as StreamSeries).y[i];
          if (v !== undefined && Number.isFinite(v)) total += v;
        }
        hi = Math.max(hi, total);
      }
      lo = 0;
    } else {
      series.forEach(s => {
        const from = Math.max(0, lowerBound(s.x, left - this.interval) - 1);
        const to = Math.min(
          s.x.length,
          lowerBound(s.x, right + this.interval) + 1
        );
        for (let i = from; i < to; i += 1) {
          const v = s.y[i] as number;
          if (Number.isFinite(v)) {
            lo = Math.min(lo, v);
            hi = Math.max(hi, v);
          }
        }
      });
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return;
    if (fromZero) {
      lo = Math.min(lo, 0);
      hi = Math.max(hi, 0);
    }
    if (hi === lo) {
      const bump = Math.abs(hi) * 0.01 || 1;
      hi += bump;
      if (!fromZero) lo -= bump;
    }
    const padding = (hi - lo) * 0.08;
    const targetLo = fromZero && lo === 0 ? 0 : lo - padding;
    const targetHi = hi + padding;
    if (this.yLo === null || this.yHi === null) {
      this.yLo = targetLo;
      this.yHi = targetHi;
    } else {
      const k = 1 - Math.exp(-dt / SCALE_EASE_MS);
      this.yLo += (targetLo - this.yLo) * k;
      this.yHi += (targetHi - this.yHi) * k;
    }
    const { yLo, yHi } = this;
    const ySpan = yHi - yLo || 1;

    const xPx = (t: number) => plotLeft + ((t - left) / windowMs) * plotWidth;
    const yPx = (v: number) => plotBottom - ((v - yLo) / ySpan) * plotHeight;

    const colors = streamColors(this.isDark);
    ctx.font = `11px ${STREAM_FONT}`;
    ctx.lineWidth = 1;

    // Horizontal gridlines and their labels.
    const yStep = niceStep(ySpan, 4);
    const maxAbs = Math.max(Math.abs(yLo), Math.abs(yHi));
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = colors.rule;
    ctx.fillStyle = colors.muted;
    ctx.beginPath();
    for (
      let v = Math.ceil(yLo / yStep) * yStep;
      v <= yHi + yStep * 1e-6;
      v += yStep
    ) {
      const y = Math.round(yPx(v)) + 0.5;
      if (y >= plotTop - 1 && y <= plotBottom + 1) {
        ctx.moveTo(plotLeft, y);
        ctx.lineTo(plotRight, y);
        ctx.fillText(formatTick(v, yStep, maxAbs), plotLeft - 8, y);
      }
    }
    ctx.stroke();

    // Time labels, at round clock times so they scroll with the data.
    const pxPerSecond = plotWidth / (windowMs / 1000);
    const stepS =
      TIME_STEPS_S.find(s => s * pxPerSecond >= 72) ??
      (TIME_STEPS_S[TIME_STEPS_S.length - 1] as number);
    const stepMs = stepS * 1000;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let t = Math.ceil(left / stepMs) * stepMs; t <= right; t += stepMs) {
      const x = xPx(t);
      if (x >= plotLeft + 24 && x <= plotRight - 24) {
        ctx.fillText(formatTime(t, stepS), x, plotBottom + 6);
      }
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(plotLeft, plotTop, plotWidth, plotHeight);
    ctx.clip();

    if (figure.kind === "bars") {
      const barWidth = Math.max(
        1,
        (this.interval / windowMs) * plotWidth * 0.72
      );
      const zero = yPx(0);
      for (let i = start; i < end; i += 1) {
        const x = xPx(base.x[i] as number) - barWidth / 2;
        let bottom = 0;
        for (let k = 0; k < series.length; k += 1) {
          const s = series[k] as StreamSeries;
          const v = s.y[i];
          if (v !== undefined && Number.isFinite(v)) {
            const from = stacked ? yPx(bottom) : zero;
            const to = stacked ? yPx(bottom + v) : yPx(v);
            ctx.fillStyle = s.color;
            ctx.fillRect(x, Math.min(from, to), barWidth, Math.abs(to - from));
            bottom += v;
          }
        }
      }
    } else {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = 1.75;
      series.forEach(s => {
        const from = Math.max(0, lowerBound(s.x, left) - 1);
        const to = Math.min(s.x.length, lowerBound(s.x, right) + 1);
        if (to - from < 1) return;
        ctx.beginPath();
        let drawing = false;
        let firstPx = 0;
        let lastPx = 0;
        for (let i = from; i < to; i += 1) {
          const v = s.y[i] as number;
          if (Number.isFinite(v)) {
            const x = xPx(s.x[i] as number);
            if (drawing) {
              ctx.lineTo(x, yPx(v));
            } else {
              ctx.moveTo(x, yPx(v));
              firstPx = x;
              drawing = true;
            }
            lastPx = x;
          }
        }
        if (!drawing) return;
        ctx.strokeStyle = s.color;
        ctx.stroke();
        if (figure.kind === "area") {
          ctx.lineTo(lastPx, yPx(0));
          ctx.lineTo(firstPx, yPx(0));
          ctx.closePath();
          ctx.globalAlpha = 0.16;
          ctx.fillStyle = s.color;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
    }

    ctx.restore();
  }
}

// One animation loop for every stream chart on the page. Each chart draws
// once per frame, at whatever rate the screen refreshes.
type Draw = (now: number, dt: number) => void;
const charts = new Set<Draw>();
let frameId = 0;
let lastFrame = 0;
let clockOffset = 0;

function frame(time: number) {
  const dt = lastFrame ? Math.min(time - lastFrame, 100) : 16;
  lastFrame = time;
  // The frame's own timestamp, put on the wall clock: steadier from frame to
  // frame than Date.now(). The two drift apart when the computer sleeps or its
  // clock is corrected, so the offset is measured again whenever they disagree.
  if (Math.abs(Date.now() - (clockOffset + time)) > 50) {
    clockOffset = Date.now() - time;
  }
  const now = clockOffset + time;
  charts.forEach(draw => draw(now, dt));
  frameId = charts.size > 0 ? requestAnimationFrame(frame) : 0;
}

export function addStreamChart(draw: Draw): () => void {
  charts.add(draw);
  if (!frameId) {
    lastFrame = 0;
    frameId = requestAnimationFrame(frame);
  }
  return () => {
    charts.delete(draw);
  };
}
