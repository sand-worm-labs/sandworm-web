// =====================================
// ⬢ Chart as an image
// =====================================
// What the result modal's Download and Copy buttons produce: the chart exactly as it
// is drawn, with its title and legend above it and its source line below. In a
// notebook the title and legend are page text next to the figure (see the theme's
// chart()), not part of it, so Plotly's own export would be the bare plot.

type Legend = { name: string; color: string };

export type ChartText = {
  title: string;
  legend: Legend[];
  source: string;
};

// Light and dark values of the theme's neutrals (sandworm_theme/tokens.py). The image
// is drawn in the reader's theme, as the chart on screen already is.
const LIGHT = { paper: "#FFFFFF", ink: "#17101C", muted: "#6F6478" };
const DARK = { paper: "#1A1A1A", ink: "#F3F0F5", muted: "#A5A5A4" };
const FONT = '"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif';

type OutputLike = { type?: string; html?: string; layout?: any };

const cleanText = (value: string | null | undefined): string =>
  (value ?? "").replace(/\s+/g, " ").trim();

// Reads the title, legend and source note the theme's chart() drew as HTML next to the
// figure. Falls back to the figure's own title, then to the block's title.
export function parseChartText(
  outputs: OutputLike[],
  blockTitle: string
): ChartText {
  let title = "";
  const legend: Legend[] = [];
  let source = "";

  outputs.forEach(output => {
    if (output.type === "html" && typeof output.html === "string") {
      const doc = new DOMParser().parseFromString(output.html, "text/html");

      const head = doc.querySelector(".sw-chart-title");
      if (head && !title) {
        title = cleanText(head.textContent);
      }

      if (legend.length === 0) {
        doc.querySelectorAll(".sw-legend span").forEach(item => {
          const name = cleanText(item.textContent);
          const swatch = item.querySelector("i") as HTMLElement | null;
          const color =
            swatch?.style.background || swatch?.style.backgroundColor;
          if (name && color) {
            legend.push({ name, color });
          }
        });
      }

      const note = doc.querySelector(".sw-note");
      if (note && !source) {
        source = cleanText(note.textContent);
      }
    }

    if (output.type === "plotly" && !title) {
      const layoutTitle = output.layout?.title;
      title = cleanText(
        typeof layoutTitle === "string" ? layoutTitle : layoutTitle?.text
      );
    }
  });

  return { title: title || cleanText(blockTitle), legend, source };
}

// Breaks text into lines no wider than `maxWidth` for the font currently set on `ctx`.
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  text.split(" ").forEach(word => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read the chart image"));
    image.src = src;
  });

export async function renderChartPng(
  graphDiv: HTMLElement,
  text: ChartText,
  isDark: boolean
): Promise<Blob> {
  // Same bundle react-plotly.js draws with, so the image matches the screen.
  const { default: Plotly } = await import("plotly.js/dist/plotly");
  const rect = graphDiv.getBoundingClientRect();
  const plotWidth = Math.round(rect.width);
  const plotHeight = Math.round(rect.height);
  const SCALE = 2;
  const plot = await loadImage(
    await Plotly.toImage(graphDiv, {
      format: "png",
      width: plotWidth,
      height: plotHeight,
      scale: SCALE,
    })
  );
  await document.fonts?.ready;

  const colors = isDark ? DARK : LIGHT;
  const PAD = 24;
  const innerWidth = plotWidth;

  // Lay out first, to know the canvas height.
  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) {
    throw new Error("Canvas is not available");
  }
  measure.font = `600 20px ${FONT}`;
  const titleLines = text.title ? wrap(measure, text.title, innerWidth) : [];
  measure.font = `400 14px ${FONT}`;
  const legendRows: Legend[][] = [];
  let row: Legend[] = [];
  let rowWidth = 0;
  text.legend.forEach(item => {
    const width = 20 + measure.measureText(item.name).width + 18;
    if (row.length && rowWidth + width > innerWidth) {
      legendRows.push(row);
      row = [];
      rowWidth = 0;
    }
    row.push(item);
    rowWidth += width;
  });
  if (row.length) legendRows.push(row);
  measure.font = `400 13px ${FONT}`;
  const sourceLines = text.source ? wrap(measure, text.source, innerWidth) : [];

  const TITLE_LINE = 26;
  const LEGEND_ROW = 22;
  const SOURCE_LINE = 20;
  const titleHeight = titleLines.length * TITLE_LINE;
  const legendHeight = legendRows.length
    ? legendRows.length * LEGEND_ROW + 6
    : 0;
  const sourceHeight = sourceLines.length
    ? sourceLines.length * SOURCE_LINE + 10
    : 0;
  const gap = titleHeight || legendHeight ? 12 : 0;
  const width = innerWidth + PAD * 2;
  const height =
    PAD + titleHeight + legendHeight + gap + plotHeight + sourceHeight + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not available");
  }
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = colors.paper;
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = "alphabetic";

  let y = PAD;
  ctx.fillStyle = colors.ink;
  ctx.font = `600 20px ${FONT}`;
  titleLines.forEach(line => {
    y += TITLE_LINE;
    ctx.fillText(line, PAD, y - 7);
  });

  ctx.font = `400 14px ${FONT}`;
  legendRows.forEach(items => {
    let x = PAD;
    y += LEGEND_ROW;
    items.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.roundRect(x, y - 15, 12, 12, 4);
      ctx.fill();
      ctx.fillStyle = colors.muted;
      ctx.fillText(item.name, x + 20, y - 4);
      x += 20 + ctx.measureText(item.name).width + 18;
    });
  });
  if (legendRows.length) y += 6;

  y += gap;
  ctx.drawImage(plot, PAD, y, plotWidth, plotHeight);
  y += plotHeight;

  ctx.fillStyle = colors.muted;
  ctx.font = `400 13px ${FONT}`;
  if (sourceLines.length) y += 10;
  sourceLines.forEach(line => {
    y += SOURCE_LINE;
    ctx.fillText(line, PAD, y - 6);
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("Could not make the image"));
    }, "image/png");
  });
}

export function fileNameFor(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "chart"}.png`;
}
