"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@sandworm/ui/hooks/use-in-view";
import { Skeleton } from "@sandworm/ui/kit/skeleton";
import { darkColor } from "@sandworm/ui/lib/plotly-dark";
import { cn } from "@sandworm/ui/lib/utils";

import { CHART_HEIGHT, terminalFigure } from "@/lib/cells/chart-figure";
import type { NativeChart as NativeChartData } from "@/lib/cells/chart-outputs";

// The cartesian bundle is a third the size of the full Plotly, and it loads only
// once a chart is near the screen, so a page of charts costs nothing until they
// are about to be seen.
const loadPlotly = () =>
  import("plotly.js/dist/plotly-cartesian.min").then(module => module.default);
type Plotly = Awaited<ReturnType<typeof loadPlotly>>;

const PLOT_CONFIG = { displayModeBar: false, scrollZoom: false };

// A notebook cell's chart drawn in the page, not in a frame: no second copy of
// the app to start, and the title and legend are the terminal's own.
type NativeChartProps = {
  chart: NativeChartData;
  // Called when the chart cannot be drawn, so the caller can show it another way
  onError: () => void;
};

export function NativeChart({ chart, onError }: NativeChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const isNear = useInView(hostRef);
  const isDark = useTheme().resolvedTheme === "dark";
  const [plotly, setPlotly] = useState<Plotly | null>(null);
  const [isDrawn, setIsDrawn] = useState(false);

  useEffect(() => {
    if (!isNear) return undefined;
    let isCurrent = true;
    loadPlotly()
      .then(lib => {
        if (isCurrent) setPlotly(lib);
      })
      .catch(() => {
        if (isCurrent) onError();
      });
    return () => {
      isCurrent = false;
    };
  }, [isNear, onError]);

  // Draws, and draws again when the theme changes
  useEffect(() => {
    const host = hostRef.current;
    if (!plotly || !host) return undefined;
    let isCurrent = true;
    const { fontFamily } = getComputedStyle(host);
    const figure = terminalFigure(chart.figure, { isDark, fontFamily });
    plotly
      .react(host, figure.data, figure.layout, PLOT_CONFIG)
      .then(() => {
        if (isCurrent) setIsDrawn(true);
      })
      .catch(() => {
        if (isCurrent) onError();
      });
    return () => {
      isCurrent = false;
    };
  }, [plotly, chart.figure, isDark, onError]);

  // Follows the card's width, and lets go of the chart when it goes
  useEffect(() => {
    const host = hostRef.current;
    if (!plotly || !host) return undefined;
    const observer = new ResizeObserver(() => {
      plotly.Plots.resize(host).catch(() => undefined);
    });
    observer.observe(host);
    return () => {
      observer.disconnect();
      plotly.purge(host);
    };
  }, [plotly]);

  return (
    <figure className="flex flex-col gap-3">
      {(chart.title || chart.legend.length > 0) && (
        <figcaption className="flex flex-col gap-2">
          {chart.title && (
            <h3 className="text-sm font-medium text-ink-100">{chart.title}</h3>
          )}
          {chart.legend.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-400">
              {chart.legend.map(item => (
                <li key={item.name} className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-block shrink-0",
                      item.isLine
                        ? "h-1 w-5 rounded-full"
                        : "size-3 rounded-[4px]"
                    )}
                    style={{
                      backgroundColor: isDark
                        ? darkColor(item.color)
                        : item.color,
                    }}
                  />
                  {item.name}
                </li>
              ))}
            </ul>
          )}
        </figcaption>
      )}
      <div className="relative" style={{ height: CHART_HEIGHT }}>
        <div ref={hostRef} aria-hidden="true" className="size-full" />
        {!isDrawn && <Skeleton className="absolute inset-0" />}
      </div>
    </figure>
  );
}
