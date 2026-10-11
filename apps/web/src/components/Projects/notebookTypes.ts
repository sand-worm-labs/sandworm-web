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
  // Each type has its own colour, so it's recognisable at a glance in view
  // mode, edit mode and while running.
  toneClassName: string;
};

export const NOTEBOOK_TYPES: NotebookType[] = [
  {
    runtime: DocumentRuntime.Cloud,
    title: "Cloud",
    description:
      "Runs on your workspace's cloud environment, with SQL, large datasets and heavy compute.",
    bestFor: "Heavy research and SQL",
    Icon: PiCloud,
    toneClassName:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30",
  },
  {
    runtime: DocumentRuntime.BrowserDashboard,
    title: "Live dashboard",
    description:
      "Runs in your browser and runs every cell when you open it, so it always shows fresh numbers.",
    bestFor: "Light, always-fresh charts",
    Icon: PiChartLine,
    toneClassName:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30",
  },
  {
    runtime: DocumentRuntime.BrowserAnalysis,
    title: "Local analysis",
    description:
      "Python and SQL run in your browser: instant start, no environment to wait for. Keep it light; heavy work belongs on the cloud.",
    bestFor: "Quick exploration",
    Icon: PiBrowser,
    toneClassName:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
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
