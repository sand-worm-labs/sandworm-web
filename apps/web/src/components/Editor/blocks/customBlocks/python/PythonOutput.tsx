import Ansi from "@cocalc/ansi-to-react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import type {
  Output,
  PythonErrorOutput,
  PythonHTMLOutput,
  PythonPlotlyOutput,
} from "@sandworm/types";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import debounce from "lodash.debounce";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PythonBlock } from "@sandworm/editor";

import { downloadFile } from "@/utils/file";
import { ChartSkeleton, Shimmer, TableSkeleton } from "@/components/Skeletons";

import useResettableState from "../../../hooks/useResettableState";
import { useTileChrome } from "../../Dashboard/TileChromeContext";

import PythonError from "./PythonError";
import { toDarkFigure } from "./plotlyDark";
import StreamChart from "./StreamChart";
import { isStreamFigure } from "./streamChart";
import { tileTopMargin, withSandwormDefaults } from "./plotlyDefaults";

// @ts-expect-error @types/react-plotly.js incompatible with @types/react@19
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const DEFAULT_PLOT_HEIGHT = 450;
const HTML_PLACEHOLDER_HEIGHT = 160;
// In a dashboard tile the skeleton of an HTML output (a chart's title or source
// note) shares a fixed-height column with the chart, so a tall one squeezes it.
const HTML_TILE_PLACEHOLDER_HEIGHT = 48;

// A chart in a dashboard tile shares its column with the HTML outputs around it, and
// takes whatever height they leave. Until they have reported their real heights that
// is a few pixels, so a chart drawn straight away is drawn tiny, then redrawn when
// they settle: the squash-then-grow flash on load. The tile's outputs tell the chart
// when its neighbours are sized, and the chart waits behind its skeleton until then.
const OutputSettleContext = React.createContext<{
  settled: boolean;
  setLoaded: (id: string, loaded: boolean) => void;
} | null>(null);

// Plotly is a large lazy chunk and draws asynchronously after mounting, so
// the output area would otherwise sit blank. Keep a skeleton in place (and
// reserve the height, to avoid layout shift) until the first draw finishes.
//
// Never rely on a single signal to clear it: onInitialized is skipped when
// anything after the first draw throws, which used to leave the skeleton on
// top of a chart that had already rendered. So any draw/update/error event
// clears it, and a timeout is the last resort.
const PLOT_SKELETON_TIMEOUT_MS = 4000;

// One shared, debounced nudge: a notebook with many charts initializing
// together triggers a single window resize, not one per chart.
const requestPlotResize = debounce(
  () => window.dispatchEvent(new Event("resize")),
  120
);

function PlotWithPlaceholder(
  props: React.ComponentProps<typeof Plot> & {
    placeholderHeight?: number;
    onDashboardTile?: boolean;
  }
) {
  const {
    placeholderHeight,
    onDashboardTile,
    onInitialized,
    onAfterPlot,
    onUpdate,
    onError,
    ...plotProps
  } = props;
  const plainTile = useTileChrome() === "plain" && !!onDashboardTile;
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), PLOT_SKELETON_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative w-full"
      style={ready ? undefined : { minHeight: placeholderHeight }}
    >
      {!ready && (
        <ChartSkeleton
          className={clsx(
            "absolute inset-0 w-full h-full z-10",
            plainTile ? "bg-transparent" : "bg-base-100",
            !plainTile &&
              (onDashboardTile
                ? "dark:bg-dropdown-bg"
                : "dark:bg-block-surface")
          )}
          aria-label="Loading chart"
        />
      )}
      <Plot
        {...plotProps}
        onInitialized={(figure, graphDiv) => {
          setReady(true);
          // The first draw can run before the container (and web fonts) have
          // their final size, which left extra whitespace until the next run.
          // react-plotly re-measures on window resize, so nudge it once now and
          // again after fonts load.
          requestPlotResize();
          document.fonts?.ready.then(requestPlotResize);
          onInitialized?.(figure, graphDiv);
        }}
        onAfterPlot={(...args: unknown[]) => {
          setReady(true);
          (onAfterPlot as ((...a: unknown[]) => void) | undefined)?.(...args);
        }}
        onUpdate={(figure, graphDiv) => {
          setReady(true);
          onUpdate?.(figure, graphDiv);
        }}
        onError={err => {
          setReady(true);
          onError?.(err);
        }}
      />
    </div>
  );
}

interface Props {
  className?: string;
  // Put on the outputs' container, for callers that watch whether it's on screen.
  containerRef?: React.Ref<HTMLDivElement>;
  // Python hasn't produced this cell's outputs in this tab yet, so they are a
  // saved snapshot. Charts from a live cell show as loading until it has: an
  // old picture of something live reads as the current one.
  awaitingLive?: boolean;
  outputs: Output[];
  isFixWithAILoading: boolean;
  canFixWithAI: boolean;
  onFixWithAI: (error: PythonErrorOutput) => void;
  isPDF: boolean;
  isDashboardView: boolean;
  // Whether this output sits inside an actual Dashboard grid tile (small,
  // fixed-size card) as opposed to a full-width notebook block that merely
  // hides stderr/controls for a cleaner report view. Only the former should
  // force Plotly figures through the tile-constrained resize path — forcing
  // it for full-width blocks squashes wide multi-subplot figures.
  isDashboardTile?: boolean;
  isPublicMode?: boolean;
  lazyRender: boolean;
  blockId: string;
  isDark?: boolean;
}

// What sandworm.plot() and sandworm.stream() charts are drawn at by default.
const LIVE_CHART_HEIGHT = 280;

// A chart a live cell (sandworm.every) produced: marked by the runtime.
function isLiveFigure(output: Output): output is PythonPlotlyOutput {
  return output.type === "plotly" && output.layout?.meta?.live === true;
}

const EXPENSIVE_TYPES = new Set<PythonBlock["result"][0]["type"]>([
  "plotly",
  "html",
]);

// =====================================
// ⬢ Pandas Table Style Injection
// =====================================

const SANDWORM_TABLE_CSS = `

  @font-face {
    font-family: "Moderat";
    src: url("/fonts/moderat/Moderat-Regular.woff2") format("woff2");
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: "Moderat";
    src: url("/fonts/moderat/Moderat-Medium.woff2") format("woff2");
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: "Moderat";
    src: url("/fonts/moderat/Moderat-Bold.woff2") format("woff2");
    font-weight: 700;
    font-style: normal;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 0;
    font-family: "Moderat", sans-serif;
    font-size: 12px;
    line-height: 16px;
    background: transparent;
    color: #343a40;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    text-align: left;
    border: none !important;
  }

  thead tr {
    height: 40px;
    background: #f9fafb;
  }

  thead th {
    padding: 8px;
    font-weight: 600;
    font-size: 12px;
    color: #6c757d;
    white-space: nowrap;
    border: none !important;
    border-bottom: 1px solid #e6e0f1 !important;
  }

  tbody {
    background: #ffffff;
  }

  tbody tr {
    border-bottom: 1px solid #e6e0f1;
  }

  tbody tr:last-child { border-bottom: none; }

  tbody td {
    padding: 8px 12px;
    font-weight: 500;
    color: #343a40;
    white-space: nowrap;
    border: none !important;
    vertical-align: middle;
  }

  /* Pandas renders the DataFrame index as a leading <th> column — hide it. Only
     pandas tables (class "dataframe"): a table a notebook draws by hand keeps its
     first header. */
  table.dataframe thead th:first-child,
  table.dataframe tbody th:first-child {
    display: none;
  }
`;

const SANDWORM_TABLE_CSS_DARK = `
  ${SANDWORM_TABLE_CSS}

  body { color: #e9ecef; }
  thead tr { background: #0f0f0f; }
  thead th { color: #a5a5a4; border-bottom: 1px solid #212529 !important; }
  tbody { background: #1a1a1a; }
  tbody tr { border-bottom: 1px solid #212529; }
  tbody td { color: #e9ecef; }
`;

// Matches pandas' truncated-repr caption, e.g. "500 rows × 4 columns"
const DATAFRAME_DIMENSIONS_REGEX = /<p>\s*(\d+ rows × \d+ columns)\s*<\/p>/;

export function getDataFrameDimensions(html: string): string | null {
  return html.match(DATAFRAME_DIMENSIONS_REGEX)?.[1] ?? null;
}

// Only real pandas frames carry the "dataframe" class — Stylers, plain HTML
// and other `_repr_html_` output don't, and the API only exports the former.
export function hasDataframeOutput(outputs: Output[]): boolean {
  return outputs.some(
    output => output.type === "html" && output.html.includes('class="dataframe')
  );
}

export const HTML_OUTPUT_HEIGHT_MESSAGE = "sandworm-html-output-height";
const HTML_OUTPUT_REQUEST_MESSAGE = "sandworm-html-output-request-height";
// If the iframe never reports a height, show it anyway rather than a skeleton forever.
const HTML_OUTPUT_FALLBACK_HEIGHT = 320;
const HTML_OUTPUT_FALLBACK_MS = 3000;

// The iframe is sandboxed without allow-same-origin, so its document is a
// cross-origin/opaque origin from the parent's perspective — the parent
// can't read `contentDocument.body.scrollHeight` directly (it silently
// resolves to null/undefined). Instead, the sandboxed content measures
// itself and reports its height back via postMessage.
const RESIZE_REPORTER_SCRIPT = `
  <script>
    function reportHeight() {
      parent.postMessage(
        { type: ${JSON.stringify(
          HTML_OUTPUT_HEIGHT_MESSAGE
        )}, height: document.documentElement.scrollHeight },
        "*"
      );
    }
    window.addEventListener("load", reportHeight);
    // The parent can also ask, in case it was not listening yet for the first report.
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === ${JSON.stringify(HTML_OUTPUT_REQUEST_MESSAGE)}) reportHeight();
    });
    reportHeight();
    new ResizeObserver(reportHeight).observe(document.body);
  </script>
`;

// A stat or summary card draws its own border and rounded corners. A dashboard
// tile already has both, so inside one the card would be a frame within a frame.
const DASHBOARD_TILE_CSS = `
  .sw-card { border: none !important; border-radius: 0 !important; background: transparent !important; }
`;

// A card tile has no padding of its own around an HTML result, so a source note
// under a chart would start on the card's edge. A plain tile sits on the page and
// keeps the note flush with the grid.
const DASHBOARD_CARD_TILE_CSS = `
  .sw-note { padding: 10px 20px 16px !important; }
`;

// Dark values for the --sw-* variables the Python theme reads (see
// apps/jupyter/sandworm_theme). The theme falls back to its light colors when a
// variable is unset, so the same HTML renders in both themes. color-scheme: dark
// is what makes the iframe's canvas transparent: next-themes sets it on the page,
// and an iframe whose own document does not match gets an opaque white one.
const SANDWORM_THEME_CSS_DARK = `
  :root {
    color-scheme: dark;
    --sw-ink: #f3f0f5;
    --sw-ink-2: #cfc8d6;
    --sw-muted: #a5a5a4;
    --sw-paper: #1a1a1a;
    --sw-shade: #2f2f2e;
    --sw-rule: #40403e;
    --sw-series-2: #c1428a;
    --sw-series-7: #9a7bdb;
    --sw-pos: #c97ff5;
    --sw-neg: #f08a84;
  }

  /* HTML a notebook already ran carries the theme's old, fixed light colors in
     its own <style>. Override the theme's classes so those results follow the
     reader's theme too, without waiting for a re-run. */
  .sw { color: var(--sw-ink) !important; }
  .sw-card { background: var(--sw-paper) !important; border-color: var(--sw-rule) !important; }
  .sw-card-head { background: var(--sw-shade) !important; border-color: var(--sw-rule) !important; }
  .sw-stat-value { color: var(--sw-ink) !important; }
  .sw-stat-label { color: var(--sw-muted) !important; }
  .sw-stat-grid { border-color: var(--sw-rule) !important; }
  .sw-note { color: var(--sw-ink-2) !important; }
`;

function injectTableStyles(
  html: string,
  isDark: boolean,
  isDashboardTile: boolean,
  plainTile = false
): string {
  // A dashboard tile is already a card, so a theme card inside it drops its own
  // border and background in either theme.
  const tileCss = isDashboardTile
    ? DASHBOARD_TILE_CSS + (plainTile ? "" : DASHBOARD_CARD_TILE_CSS)
    : "";
  const themeCss = isDark
    ? `${SANDWORM_TABLE_CSS_DARK}${SANDWORM_THEME_CSS_DARK}`
    : SANDWORM_TABLE_CSS;
  const styleTag = `<style>${themeCss}${tileCss}</style>`;

  // The "N rows × M columns" caption is surfaced in the block's result
  // footer instead, so drop it from the iframe content entirely.
  const withoutDimensions = html.replace(DATAFRAME_DIMENSIONS_REGEX, "");

  if (withoutDimensions.includes("</head>")) {
    return withoutDimensions
      .replace("</head>", `${styleTag}</head>`)
      .concat(RESIZE_REPORTER_SCRIPT);
  }
  return styleTag + withoutDimensions + RESIZE_REPORTER_SCRIPT;
}

export function PythonOutputs(props: Props) {
  // A plain dashboard tile has no card behind the output, so it paints none either.
  const plainTile = useTileChrome() === "plain" && !!props.isDashboardTile;
  // Lazy rendering starts over when the outputs change shape (a new run: its
  // result is cleared first), not when they're refreshed in place. A live cell
  // replaces its outputs on every tick with the same kinds of output; starting
  // over then would swap each chart for a placeholder and redraw it, which
  // shows as a flicker. Kept mounted, the chart just updates.
  const outputsShape = props.outputs.map(output => output.type).join(",");
  const [rendered, setRendered] = useResettableState(
    () => Math.min(props.lazyRender ? 1 : props.outputs.length),
    [outputsShape, props.lazyRender]
  );

  useEffect(() => {
    if (!props.lazyRender || rendered === props.outputs.length) {
      return () => {};
    }

    const cb = () => {
      setRendered(prev => {
        const nextExpensiveTypeIndex = props.outputs.findIndex(
          (output, i) => i > prev && EXPENSIVE_TYPES.has(output.type)
        );

        return nextExpensiveTypeIndex !== -1
          ? nextExpensiveTypeIndex
          : props.outputs.length;
      });
    };

    // requestAnimationFrame is paused in background tabs, which would leave the
    // placeholders on screen indefinitely; a timer guarantees progress. Only
    // the first of the two to fire advances.
    let advanced = false;
    const advanceOnce = () => {
      if (advanced) return;
      advanced = true;
      cb();
    };
    const anim = requestAnimationFrame(advanceOnce);
    const fallback = setTimeout(advanceOnce, 150);

    return () => {
      cancelAnimationFrame(anim);
      clearTimeout(fallback);
    };
  }, [props.outputs, rendered, props.lazyRender]);

  const [loadedHtml, setLoadedHtml] = React.useState<ReadonlySet<string>>(
    () => new Set()
  );
  const setLoaded = useCallback((id: string, loaded: boolean) => {
    setLoadedHtml(prev => {
      if (prev.has(id) === loaded) return prev;
      const next = new Set(prev);
      if (loaded) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  // Every HTML output counts, mounted yet or not. With lazyRender the source note
  // under a chart mounts after the chart, so counting only the mounted ones let the
  // chart settle early, draw against a box the note later shrank, and stay wrong.
  const htmlCount = props.outputs.filter(
    output => output.type === "html"
  ).length;
  const settleValue = useMemo(
    () => ({ settled: loadedHtml.size >= htmlCount, setLoaded }),
    [loadedHtml, htmlCount, setLoaded]
  );

  return (
    <OutputSettleContext.Provider value={settleValue}>
      <div className={props.className} ref={props.containerRef}>
        {props.outputs.slice(0, rendered).map((output, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={clsx(
              ["plotly"].includes(output.type) ? "flex-grow" : "",
              "overflow-x-auto",

              plainTile && "bg-transparent",
              !plainTile && "bg-base-100",
              !plainTile &&
                (props.isDashboardTile
                  ? "dark:bg-dropdown-bg"
                  : "dark:bg-block-surface")
            )}
          >
            {props.awaitingLive && isLiveFigure(output) ? (
              <ChartSkeleton
                className={clsx("w-full", props.isDashboardTile && "h-full")}
                style={
                  props.isDashboardTile
                    ? undefined
                    : { height: output.layout?.height ?? LIVE_CHART_HEIGHT }
                }
                aria-label="Waiting for Python to start"
              />
            ) : (
              <PythonOutput
                output={output}
                isFixWithAILoading={props.isFixWithAILoading}
                onFixWithAI={props.onFixWithAI}
                isPDF={props.isPDF}
                canFixWithAI={props.canFixWithAI}
                isDashboardView={props.isDashboardView}
                isDashboardTile={props.isDashboardTile}
                isPublicMode={props.isPublicMode}
                blockId={props.blockId}
                isDark={props.isDark ?? false}
              />
            )}
          </div>
        ))}
        {props.outputs.slice(rendered).map((output, i) => (
          <Shimmer
            // eslint-disable-next-line react/no-array-index-key
            key={rendered + i}
            className="w-full"
            style={{
              height: EXPENSIVE_TYPES.has(output.type)
                ? DEFAULT_PLOT_HEIGHT
                : 48,
            }}
          />
        ))}
      </div>
    </OutputSettleContext.Provider>
  );
}

interface ItemProps {
  output: Output;
  isFixWithAILoading: boolean;
  onFixWithAI: (error: PythonErrorOutput) => void;
  isPDF: boolean;
  isDashboardView: boolean;
  isDashboardTile?: boolean;
  isPublicMode?: boolean;
  canFixWithAI: boolean;
  blockId: string;
  isDark: boolean;
}

export function PythonOutput(props: ItemProps) {
  const onExportToPNG = () => {
    if (props.output.type !== "image" || props.output.format !== "png") return;

    downloadFile(
      `data:image/${props.output.format};base64, ${props.output.data}`,
      props.blockId
    );
  };

  switch (props.output.type) {
    case "image":
      switch (props.output.format) {
        case "png":
          return (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="printable-block w-full"
                alt="generated figure"
                src={`data:image/${props.output.format};base64, ${props.output.data}`}
              />
              {!props.isDashboardView && (
                <div className="w-full flex flex-col items-end">
                  <button
                    type="button"
                    className="bg-base-600 rounded-md rounded-br-md border border-border-secondary p-1 px-3 z-10 text-xs text-ink-400"
                    onClick={onExportToPNG}
                  >
                    PNG
                  </button>
                </div>
              )}
            </>
          );
        default:
          return null;
      }
    case "stdio":
      // Warnings printed to stderr (deprecation notices, etc.) are useful
      // context in the notebook, but read as a broken/erroring chart when
      // they sit above the actual result in a dashboard tile — hide them
      // there and let the tile show only its real output.
      if (props.isDashboardView && props.output.name === "stderr") {
        return null;
      }
      return (
        <pre
          className={clsx(
            props.output.name === "stderr" ? "text-red-500" : "",
            "text-sm font-output"
          )}
        >
          <Ansi>{props.output.text}</Ansi>
        </pre>
      );
    case "plotly": {
      // sandworm.stream() figures scroll on a canvas. A PDF has no motion, so
      // it gets the same figure as a still Plotly chart.
      if (!props.isPDF && isStreamFigure(props.output)) {
        return (
          <StreamChart
            output={props.output}
            isDark={!!props.isDark}
            fillHeight={!!props.isDashboardTile}
          />
        );
      }
      return (
        <PythonPlotOutput
          output={props.output}
          isDark={!!props.isDark}
          isPDF={props.isPDF}
          isDashboardView={props.isDashboardView}
          isDashboardTile={!!props.isDashboardTile}
        />
      );
    }
    case "html": {
      return (
        <HTMLOutput
          output={props.output}
          isDark={props.isDark}
          isDashboardTile={!!props.isDashboardTile}
        />
      );
    }
    case "markdown":
      // From IPython's display(Markdown(...)). sandworm-prose carries the
      // same type scale as rich-text and markdown cells (see globals.scss).
      return (
        <div className="sw-markdown-preview max-w-full font-body sandworm-prose px-1 py-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {props.output.text}
          </ReactMarkdown>
        </div>
      );
    case "error":
      return (
        <PythonError
          canFixWithAI={props.canFixWithAI}
          error={props.output}
          isFixWithAILoading={props.isFixWithAILoading}
          onFixWithAI={props.onFixWithAI}
          isPublic={!!props.isPublicMode}
        />
      );
    default:
      return null;
  }
}

type PythonOutputWrapperProps = {
  outputs: React.JSX.Element[];
  isCollapsed: boolean;
  collapseToggle: () => void;
};

export function PythonOutputWrapper(props: PythonOutputWrapperProps) {
  return (
    <div className="pt-3.5 ph-no-capture printable-block">
      <div className="px-3 text-xs text-gray-300 pb-3.5 flex items-center gap-x-0.5">
        <button
          type="button"
          className="h-4 w-4 hover:text-ink-400"
          onClick={props.collapseToggle}
        >
          {props.isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
        </button>
        <span>{props.isCollapsed ? "Output collapsed" : "Output"}</span>
      </div>
      <div className={clsx(props.isCollapsed ? "hidden" : "", "px-8 pb-6")}>
        {props.outputs}
      </div>
    </div>
  );
}

function HTMLOutput(props: {
  output: PythonHTMLOutput;
  isDark: boolean;
  isDashboardTile: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Starts at 0 rather than a fixed guess — the iframe's content height
  // varies a lot (a 3-row dataframe vs. a 500-row one). The sandboxed
  // iframe reports its real height via postMessage once it loads (see
  // RESIZE_REPORTER_SCRIPT), since it's cross-origin and can't be measured
  // directly through contentDocument.
  const [height, setHeight] = React.useState(0);

  const plainTile = useTileChrome() === "plain";
  const styledHtml = useMemo(
    () =>
      injectTableStyles(
        props.output.html,
        props.isDark,
        props.isDashboardTile,
        plainTile
      ),
    [props.output.html, props.isDark, props.isDashboardTile, plainTile]
  );

  // Layout effect, not useEffect: this must be listening before the iframe can
  // load and post its one report. A passive effect can run after the load on a
  // busy page, the message is dropped, and the skeleton never clears.
  useLayoutEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.source !== iframeRef.current?.contentWindow ||
        event.data?.type !== HTML_OUTPUT_HEIGHT_MESSAGE
      ) {
        return;
      }
      if (typeof event.data.height === "number" && event.data.height > 0) {
        setHeight(event.data.height);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Last resort: if no height ever arrives, stop showing a skeleton.
  useEffect(() => {
    const timer = setTimeout(
      () => setHeight(current => current || HTML_OUTPUT_FALLBACK_HEIGHT),
      HTML_OUTPUT_FALLBACK_MS
    );
    return () => clearTimeout(timer);
  }, [styledHtml]);

  const loaded = height > 0;

  // Tell the tile's chart (if any) when this output has its real height.
  const settle = React.useContext(OutputSettleContext);
  const settleId = React.useId();
  const setSettled = settle?.setLoaded;
  useEffect(() => {
    setSettled?.(settleId, loaded);
    return () => setSettled?.(settleId, false);
  }, [loaded, settleId, setSettled]);

  return (
    <div className="relative w-full">
      {!loaded && (
        <TableSkeleton
          className="w-full"
          style={{
            minHeight: props.isDashboardTile
              ? HTML_TILE_PLACEHOLDER_HEIGHT
              : HTML_PLACEHOLDER_HEIGHT,
          }}
          aria-label="Loading output"
        />
      )}
      <iframe
        ref={iframeRef}
        srcDoc={styledHtml}
        title="HTML block"
        // Scripts, plus links that open in a new tab so a banner or a social icon
        // works. The popup is not sandboxed, or the site it opens would be broken
        // too; without allow-same-origin the notebook's own page stays out of reach.
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        onLoad={() =>
          // Ask the page for its height once it has loaded (handshake).
          iframeRef.current?.contentWindow?.postMessage(
            { type: HTML_OUTPUT_REQUEST_MESSAGE },
            "*"
          )
        }
        style={{
          width: "100%",
          height,
          border: "none",
          // Keep the iframe loading, but out of the flow until sized.
          position: loaded ? undefined : "absolute",
          visibility: loaded ? undefined : "hidden",
        }}
      />
    </div>
  );
}
const MAX_PIE_LABELS = 1000;

function PythonPlotOutput(props: {
  output: PythonPlotlyOutput;
  isDark: boolean;
  isPDF: boolean;
  isDashboardView: boolean;
  isDashboardTile: boolean;
}) {
  const settle = React.useContext(OutputSettleContext);
  // The stored figure carries the light theme's colors; swap in the dark ones
  // when the reader is in dark mode (see plotlyDark.ts).
  const output = useMemo(() => {
    // Defaults first (they may add white tile lines), then the dark swap.
    const themed = withSandwormDefaults(props.output);
    const figure = props.isDark ? toDarkFigure(themed) : themed;
    // A live cell redraws this chart with new data. Unless the figure says
    // otherwise, keep the reader's zoom, pan and legend choices across those
    // updates.
    //
    // Updates are not eased by default. Plotly animates the traces and the
    // axes one after the other, each for the full duration, so on a chart
    // whose time axis moves with every update the animation is still running
    // when the next update lands: it stutters, and charts it can't animate
    // (bars, heatmaps, pies) blink instead. A figure that wants easing can set
    // its own layout.transition.
    return {
      ...figure,
      layout: {
        ...figure.layout,
        uirevision: figure.layout?.uirevision ?? "keep",
      },
    };
  }, [props.output, props.isDark]);

  const layout = useMemo(() => {
    return {
      ...output.layout,
      autosize: true,
    };
  }, [output.layout]);

  const hideControls = useMemo(() => {
    return props.isPDF || props.isDashboardView;
  }, [props.isPDF, props.isDashboardView]);

  const config = useMemo(() => {
    if (hideControls) {
      return {
        displaylogo: false,
        displayModeBar: false,
        responsive: true,
      };
    }

    return {
      displaylogo: false,
      responsive: true,
    };
  }, [hideControls]);

  const data = useMemo(() => {
    return output.data.map((d: any) => ({
      ...d,
      labels: d.type === "pie" ? d.labels?.slice(0, MAX_PIE_LABELS) : d.labels,
    }));
  }, [output.data]);

  if (props.isDashboardTile) {
    return (
      <DashboardPlotOutput
        output={output}
        waiting={!!settle && !settle.settled}
      />
    );
  }

  return (
    <PlotWithPlaceholder
      data={data}
      layout={layout}
      config={config}
      frames={output.frames}
      useResizeHandler
      className="w-full printable-block"
      // autosize reads its container: give it a definite height instead of
      // "auto", so the first draw and every later one measure the same box.
      style={{
        width: "100%",
        height: output.layout?.height ?? DEFAULT_PLOT_HEIGHT,
      }}
      placeholderHeight={output.layout?.height ?? DEFAULT_PLOT_HEIGHT}
    />
  );
}

// Below this a measured box is a failed measurement (e.g. a percentage height
// that did not resolve), not a real tile: drawing into it would give Plotly a
// zero/negative height and an invisible chart.
const MIN_MEASURED_PX = 24;

function DashboardPlotOutput(props: {
  output: PythonPlotlyOutput;
  // The outputs around the chart have not reported their heights yet.
  waiting: boolean;
}) {
  const [size, setSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  // A state-backed callback ref: the effect below runs when the box mounts,
  // instead of depending on a ref's `.current`, which never triggers a render.
  const [box, setBox] = React.useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!box) {
      return () => {};
    }

    const measure = () => {
      const { width, height } = box.getBoundingClientRect();
      setSize(prev =>
        prev &&
        Math.abs(prev.width - width) < 1 &&
        Math.abs(prev.height - height) < 1
          ? prev
          : { width, height }
      );
    };

    // Draw at the right size on the first paint; only later resizes are debounced.
    measure();

    // The plot is absolutely positioned inside the box, so it never feeds back
    // into the box's own size and this cannot loop.
    const onResize = debounce(measure, 100);
    const observer = new ResizeObserver(onResize);
    observer.observe(box);

    return () => {
      onResize.cancel();
      observer.disconnect();
    };
    // Measure again the moment the chart stops waiting: its box has its final size.
  }, [box, props.waiting]);

  const config = useMemo(
    () => ({
      displaylogo: false,
      displayModeBar: false,
      responsive: true,
    }),
    []
  );

  // The plot's div, kept so a change of size can be pushed to Plotly (see below).
  const graphDivRef = useRef<HTMLElement | null>(null);

  const layout = useMemo(() => {
    const defaultWidth = 700;
    const givenWidth = props.output.layout.width ?? defaultWidth;
    const actualWidth =
      size && size.width >= MIN_MEASURED_PX ? size.width : givenWidth;

    const defaultHeight = 450;
    const givenHeight = props.output.layout.height ?? defaultHeight;
    const actualHeight =
      (size && size.height >= MIN_MEASURED_PX ? size.height : givenHeight) - 6;

    const wScale = actualWidth / givenWidth;
    const hScale = actualHeight / givenHeight;

    // https://plotly.com/python/reference/layout/#layout-font-size
    const defaultFontSize = 12;

    return {
      ...props.output.layout,
      autosize: true,
      width: actualWidth,
      height: actualHeight,
      // Plotly's default margins (~100px top, 80px elsewhere) are sized for a
      // full notebook figure and leave almost no plot area in a small tile.
      // Keep a figure's own margins; otherwise use compact ones. Legends still
      // expand the margin themselves.
      margin: props.output.layout.margin ?? {
        l: 56,
        r: 24,
        t: tileTopMargin(props.output.layout, props.output.data ?? []),
        b: 44,
      },
      font: props.output.layout.font ?? {
        size: defaultFontSize * Math.min(wScale, hScale, 1),
      },
    };
  }, [props.output.layout, size]);

  // Plotly sizes itself once, when it draws, and fits things like bar labels and
  // margins to that box. If the tile is resized afterwards (a neighbouring output
  // reported its height late), the new layout size alone did not always make it
  // lay out again, and the chart kept the squashed first layout. Ask it to measure
  // its div again whenever the size we hand it changes after the first draw.
  useEffect(() => {
    const graphDiv = graphDivRef.current;
    if (!graphDiv) return () => {};
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      import("plotly.js/dist/plotly")
        .then(({ default: Plotly }) => {
          if (!cancelled && graphDivRef.current === graphDiv) {
            return Plotly.Plots.resize(graphDiv);
          }
          return undefined;
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [layout.width, layout.height]);

  return (
    <div ref={setBox} className="relative w-full h-full">
      {props.waiting && (
        <ChartSkeleton
          className="absolute inset-0 w-full h-full"
          aria-label="Loading chart"
        />
      )}
      {!props.waiting && size && (
        <div className="absolute inset-0 overflow-hidden">
          <PlotWithPlaceholder
            data={props.output.data}
            layout={layout}
            config={config}
            frames={props.output.frames}
            useResizeHandler
            // Match the pixel size we hand Plotly, so its own window-resize
            // handling re-reads the same box instead of an auto-sized one.
            style={{ width: layout.width, height: layout.height }}
            placeholderHeight={layout.height}
            onDashboardTile
            onInitialized={(_figure: unknown, graphDiv: HTMLElement) => {
              graphDivRef.current = graphDiv;
            }}
            onUpdate={(_figure: unknown, graphDiv: HTMLElement) => {
              graphDivRef.current = graphDiv;
            }}
          />
        </div>
      )}
    </div>
  );
}
