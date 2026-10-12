import clsx from "clsx";
import { useEffect, useMemo, useRef } from "react";
import type { PythonPlotlyOutput } from "@sandworm/types";

import {
  STREAM_FONT,
  StreamRenderer,
  addStreamChart,
  parseStreamFigure,
  streamColors,
} from "./streamChart";

const DEFAULT_HEIGHT = 280;

// A sandworm.stream() figure, drawn on a canvas that scrolls on every frame.
// React renders it once per data update; the motion in between is the
// renderer's, outside React.
export default function StreamChart(props: {
  output: PythonPlotlyOutput;
  isDark: boolean;
  // In a dashboard tile the chart takes the tile's height instead of its own.
  fillHeight: boolean;
}) {
  const figure = useMemo(
    () => parseStreamFigure(props.output, props.isDark),
    [props.output, props.isDark]
  );

  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<StreamRenderer | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!box || !canvas || !ctx) return undefined;

    const renderer = new StreamRenderer(ctx);
    rendererRef.current = renderer;

    const fit = () => {
      const { width, height } = box.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      renderer.resize(width, height, dpr);
    };
    fit();
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(box);

    // Charts scrolled out of view cost nothing: they skip their frames.
    let onScreen = true;
    const visibility = new IntersectionObserver(entries => {
      const entry = entries[entries.length - 1];
      if (entry) onScreen = entry.isIntersecting;
    });
    visibility.observe(box);

    const remove = addStreamChart((now, dt) => {
      if (onScreen) renderer.draw(now, dt);
    });

    return () => {
      remove();
      resizeObserver.disconnect();
      visibility.disconnect();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setFigure(figure);
  }, [figure]);

  useEffect(() => {
    rendererRef.current?.setTheme(props.isDark);
  }, [props.isDark]);

  const colors = streamColors(props.isDark);
  const named = figure.series.filter(s => s.name !== null);

  return (
    <div
      className={clsx(
        "flex flex-col w-full",
        props.fillHeight && "h-full min-h-[120px]"
      )}
      style={{
        fontFamily: STREAM_FONT,
        height: props.fillHeight
          ? undefined
          : (figure.height ?? DEFAULT_HEIGHT),
      }}
    >
      {figure.title && (
        <div
          className="px-1 text-sm font-semibold truncate"
          style={{ color: colors.ink }}
        >
          {figure.title}
        </div>
      )}
      {named.length > 1 && (
        <div
          className="px-1 pt-0.5 flex flex-wrap gap-x-3 text-xs"
          style={{ color: colors.muted }}
        >
          {named.map(s => (
            <span key={s.name} className="inline-flex items-center gap-x-1">
              <i
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ background: s.color }}
              />
              {s.name}
            </span>
          ))}
        </div>
      )}
      <div ref={boxRef} className="relative flex-1 min-h-0 mt-1">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
}
