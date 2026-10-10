import type { IconType } from "react-icons";
import { PiBrowser, PiChartLine, PiCloud } from "react-icons/pi";

import { DocumentRuntime } from "@/generated/graphql";

// The notebook types, in the order they're offered. Used by the new notebook
// dialog and the type menu in a notebook's top bar.
export type NotebookType = {
  runtime: DocumentRuntime;
  title: string;
  description: string;
  bestFor: string;
  Icon: IconType;
};

export const NOTEBOOK_TYPES: NotebookType[] = [
  {
    runtime: DocumentRuntime.Cloud,
    title: "Cloud",
    description:
      "Runs on your workspace's cloud environment, with SQL, large datasets and heavy compute.",
    bestFor: "Heavy research and SQL",
    Icon: PiCloud,
  },
  {
    runtime: DocumentRuntime.BrowserDashboard,
    title: "Live dashboard",
    description:
      "Runs in your browser and runs every cell when you open it, so it always shows fresh numbers.",
    bestFor: "Light, always-fresh charts",
    Icon: PiChartLine,
  },
  {
    runtime: DocumentRuntime.BrowserAnalysis,
    title: "Local analysis",
    description:
      "Python and SQL run in your browser: instant start, no environment to wait for. Keep it light; heavy work belongs on the cloud.",
    bestFor: "Quick exploration",
    Icon: PiBrowser,
  },
];

export function getNotebookType(
  runtime: DocumentRuntime | null | undefined
): NotebookType {
  return (
    NOTEBOOK_TYPES.find(type => type.runtime === runtime) ??
    (NOTEBOOK_TYPES[0] as NotebookType)
  );
}
