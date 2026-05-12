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
}

const EXPENSIVE_TYPES = new Set<PythonBlock["result"][0]["type"]>([
  "plotly",
  "html",
]);

// =====================================
// ⬢ Pandas Table Style Injection
// =====================================

const SANDWORM_TABLE_CSS = `
  @import url('https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/fonts/geist-mono/style.css');

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 12px;
    font-family: "Geist Mono", ui-monospace, monospace;
    font-size: 12px;
    background: transparent;
    color: #111827;
  }

  .dataframe-wrap {
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    border: none !important;
  }

  thead tr {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  thead th {
    padding: 9px 16px;
    text-align: left;
    font-weight: 500;
    font-size: 11px;
    text-transform: capitalize;
    letter-spacing: 0.06em;
    color: #9ca3af;
    white-space: nowrap;
    border: none !important;
  }

  tbody tr {
    border-bottom: 1px solid #f3f4f6;
  }

  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #fafafa; }

  tbody td {
    padding: 9px 16px;
    color: #374151;
    border: none !important;
    vertical-align: middle;
  }

  thead th:first-child,
  tbody td:first-child {
    font-weight: 600;
    color: #6b7280;
    min-width: 40px;
  }
`;

function injectTableStyles(html: string): string {
  const styleTag = `<style>${SANDWORM_TABLE_CSS}</style>`;

  // Wrap table in a clipping div for border-radius to work
  const wrapped = html
    .replace(/<table/g, '<div class="dataframe-wrap"><table')
    .replace(/<\/table>/g, "</table></div>");

  if (wrapped.includes("</head>")) {
    return wrapped.replace("</head>", `${styleTag}</head>`);
  }
  return styleTag + wrapped;
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
            "bg-base-100 overflow-x-auto"
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
      return <HTMLOutput output={props.output} />;
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

function HTMLOutput(props: { output: PythonHTMLOutput }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState(500);

  const styledHtml = useMemo(
    () => injectTableStyles(props.output.html),
    [props.output.html]
  );

  return (
    <iframe
      ref={iframeRef}
      srcDoc={styledHtml}
      title="HTML block"
      sandbox="allow-scripts"
      style={{ width: "100%", height, border: "none" }}
      onLoad={() => {
        try {
          const h = iframeRef.current?.contentDocument?.body?.scrollHeight;
          if (h && h > 0) setHeight(h + 24);
        } catch {}
      }}
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
