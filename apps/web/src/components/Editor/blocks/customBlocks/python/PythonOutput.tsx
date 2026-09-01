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
import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import debounce from "lodash.debounce";
import type { PythonBlock } from "@sandworm/editor";

import { downloadFile } from "@/utils/file";

import useResettableState from "../../../hooks/useResettableState";

import PythonError from "./PythonError";

// @ts-expect-error @types/react-plotly.js incompatible with @types/react@19
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
  className?: string;
  outputs: Output[];
  isFixWithAILoading: boolean;
  canFixWithAI: boolean;
  onFixWithAI: (error: PythonErrorOutput) => void;
  isPDF: boolean;
  isDashboardView: boolean;
  lazyRender: boolean;
  blockId: string;
  isDark?: boolean;
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

  /* Pandas renders the DataFrame index as a leading <th> column — hide it. */
  thead th:first-child,
  tbody th:first-child {
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

export const HTML_OUTPUT_HEIGHT_MESSAGE = "sandworm-html-output-height";

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
    new ResizeObserver(reportHeight).observe(document.body);
  </script>
`;

function injectTableStyles(html: string, isDark: boolean): string {
  const styleTag = `<style>${isDark ? SANDWORM_TABLE_CSS_DARK : SANDWORM_TABLE_CSS}</style>`;

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
  const [rendered, setRendered] = useResettableState(
    () => Math.min(props.lazyRender ? 1 : props.outputs.length),
    [props.outputs, props.lazyRender]
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

    const anim = requestAnimationFrame(cb);

    return () => {
      cancelAnimationFrame(anim);
    };
  }, [props.outputs, rendered, props.lazyRender]);

  return (
    <div className={props.className}>
      {props.outputs.slice(0, rendered).map((output, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={clsx(
            ["plotly"].includes(output.type) ? "flex-grow" : "",
            "bg-base-100 dark:bg-header-surface overflow-x-auto"
          )}
        >
          <PythonOutput
            output={output}
            isFixWithAILoading={props.isFixWithAILoading}
            onFixWithAI={props.onFixWithAI}
            isPDF={props.isPDF}
            canFixWithAI={props.canFixWithAI}
            isDashboardView={props.isDashboardView}
            blockId={props.blockId}
            isDark={props.isDark ?? false}
          />
        </div>
      ))}
    </div>
  );
}

interface ItemProps {
  output: Output;
  isFixWithAILoading: boolean;
  onFixWithAI: (error: PythonErrorOutput) => void;
  isPDF: boolean;
  isDashboardView: boolean;
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
      return (
        <PythonPlotOutput
          output={props.output}
          isPDF={props.isPDF}
          isDashboardView={props.isDashboardView}
        />
      );
    }
    case "html": {
      return <HTMLOutput output={props.output} isDark={props.isDark} />;
    }
    case "error":
      return (
        <PythonError
          canFixWithAI={props.canFixWithAI}
          error={props.output}
          isFixWithAILoading={props.isFixWithAILoading}
          onFixWithAI={props.onFixWithAI}
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

function HTMLOutput(props: { output: PythonHTMLOutput; isDark: boolean }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Starts at 0 rather than a fixed guess — the iframe's content height
  // varies a lot (a 3-row dataframe vs. a 500-row one). The sandboxed
  // iframe reports its real height via postMessage once it loads (see
  // RESIZE_REPORTER_SCRIPT), since it's cross-origin and can't be measured
  // directly through contentDocument.
  const [height, setHeight] = React.useState(0);

  const styledHtml = useMemo(
    () => injectTableStyles(props.output.html, props.isDark),
    [props.output.html, props.isDark]
  );

  useEffect(() => {
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

  return (
    <iframe
      ref={iframeRef}
      srcDoc={styledHtml}
      title="HTML block"
      sandbox="allow-scripts"
      style={{ width: "100%", height, border: "none" }}
    />
  );
}
const MAX_PIE_LABELS = 1000;

function PythonPlotOutput(props: {
  output: PythonPlotlyOutput;
  isPDF: boolean;
  isDashboardView: boolean;
}) {
  const layout = useMemo(() => {
    return {
      ...props.output.layout,
      autosize: true,
    };
  }, [props.output.layout]);

  const hideControls = useMemo(() => {
    return props.isPDF || props.isDashboardView;
  }, [props.isPDF, props.isDashboardView]);

  const config = useMemo(() => {
    if (hideControls) {
      return {
        displaylogo: false,
        displayModeBar: false,
      };
    }

    return {
      displaylogo: false,
    };
  }, [hideControls]);

  const data = useMemo(() => {
    return props.output.data.map((d: any) => ({
      ...d,
      labels: d.type === "pie" ? d.labels?.slice(0, MAX_PIE_LABELS) : d.labels,
    }));
  }, [props.output.data]);

  if (props.isDashboardView) {
    return <DashboardPlotOutput output={props.output} />;
  }

  return (
    <Plot
      data={data}
      layout={layout}
      config={config}
      frames={props.output.frames}
      useResizeHandler
      className="w-full printable-block"
    />
  );
}

function DashboardPlotOutput(props: { output: PythonPlotlyOutput }) {
  const [size, setSize] = useResettableState(
    () => null as { width: number; height: number } | null,
    [props.output.layout]
  );

  const measureDiv = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!size && measureDiv.current) {
      const { width, height } = measureDiv.current.getBoundingClientRect();
      setSize({ width, height });
    }
  }, [measureDiv.current, size]);

  useEffect(() => {
    if (!container.current) {
      return () => {};
    }

    const parent = container.current.parentElement;
    if (!parent) {
      return () => {};
    }

    const observer = new ResizeObserver(
      debounce(() => {
        setSize(null);
      }, 500)
    );

    observer.observe(parent);

    return () => {
      observer.disconnect();
    };
  }, [container]);

  const config = useMemo(
    () => ({
      displaylogo: false,
      displayModeBar: false,
      responsive: true,
    }),
    []
  );

  const layout = useMemo(() => {
    const defaultWidth = 700;
    const givenWidth = props.output.layout.width ?? defaultWidth;
    const actualWidth = size?.width ?? givenWidth;

    const defaultHeight = 450;
    const givenHeight = props.output.layout.height ?? defaultHeight;
    const actualHeight = (size?.height ?? givenHeight) - 6;

    const wScale = actualWidth / givenWidth;
    const hScale = actualHeight / givenHeight;

    // https://plotly.com/python/reference/layout/#layout-font-size
    const defaultFontSize = 12;

    return {
      ...props.output.layout,
      autosize: true,
      width: actualWidth,
      height: actualHeight,
      font: props.output.layout.font ?? {
        size: defaultFontSize * Math.min(wScale, hScale, 1),
      },
    };
  }, [props.output.layout, size]);

  if (!size) {
    return <div className="w-full h-full" ref={measureDiv} />;
  }

  return (
    <div ref={container}>
      <Plot
        data={props.output.data}
        layout={layout}
        config={config}
        frames={props.output.frames}
        useResizeHandler
      />
    </div>
  );
}
