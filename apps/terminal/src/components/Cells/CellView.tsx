"use client";

import { useCallback, useMemo, useState } from "react";
import type { Output } from "@sandworm/types";

import { CellOutputs } from "@/components/Briefing/CellOutputs";
import {
  toNativeChart,
  type NativeChart as NativeChartData,
} from "@/lib/cells/chart-outputs";

import { NativeChart } from "./NativeChart";

type CellViewProps = {
  outputs: readonly Output[];
  title: string;
};

// What a notebook cell drew. A single chart is drawn in the page, which is fast;
// anything else (tables, cards, charts with their own buttons), and a chart that
// fails to draw, goes to the notebook's own renderer in a frame, exactly as the
// notebook draws it.
export function CellView({ outputs, title }: CellViewProps) {
  const chart = useMemo(() => toNativeChart(outputs), [outputs]);
  const [failed, setFailed] = useState<NativeChartData | null>(null);
  const onError = useCallback(() => chart && setFailed(chart), [chart]);

  return chart && failed !== chart ? (
    <NativeChart chart={chart} onError={onError} />
  ) : (
    <CellOutputs outputs={outputs} title={title} />
  );
}
