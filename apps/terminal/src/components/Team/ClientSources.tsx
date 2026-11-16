"use client";

import { useState } from "react";
import { Button } from "@sandworm/ui/kit/button";
import { Card } from "@sandworm/ui/kit/card";

import { runTeamSource, type RunSourceResult } from "@/lib/team/actions";
import { pluralise } from "@/lib/format";
import { describeLastRun, describeSchedule } from "@/lib/team/source-state";
import { webAppUrl } from "@/lib/web-app";
import type { TeamClientSource } from "@/types";

const headerCellClassName = "px-3 py-2.5 text-xs font-medium text-ink-400";
const cellClassName = "border-t border-border-secondary px-3 py-3 align-middle";

function summary(result: RunSourceResult): string {
  if (!result.ok) return result.message;
  const { run } = result;
  if (run.status === "running") {
    return `Still running after ${pluralise(run.cells, "cell")}. It carries on in the background.`;
  }
  if (run.failed.length === 0)
    return `Ran ${pluralise(run.cells, "cell")}, all succeeded.`;
  return `Ran ${pluralise(run.cells, "cell")}, ${run.failed.length} failed: ${run.failed
    .map(({ title, message }) => `${title} (${message})`)
    .join("; ")}`;
}

type ClientSourcesProps = {
  clientId: string;
  sources: readonly TeamClientSource[];
};

// The notebooks a client's terminal is built from. "Run now" runs one as you,
// the way pressing Run in the notebook does; the page says what happened.
export function ClientSources({ clientId, sources }: ClientSourcesProps) {
  const [runningId, setRunningId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RunSourceResult>>({});

  const run = async (documentId: string) => {
    setRunningId(documentId);
    try {
      const result = await runTeamSource(clientId, documentId);
      setResults(previous => ({ ...previous, [documentId]: result }));
    } finally {
      setRunningId(null);
    }
  };

  return (
    <Card aria-labelledby="sources-title" className="flex flex-col">
      <div className="px-6 pb-3 pt-[22px]">
        <h2 id="sources-title" className="text-base font-medium text-ink-100">
          Notebooks
        </h2>
        <p className="mt-0.5 text-[13px] text-ink-400">
          What this client&apos;s briefing, signals and analysis are built from.
        </p>
      </div>
      {sources.length === 0 ? (
        <p className="border-t border-border-secondary px-6 py-10 text-center text-sm text-ink-400">
          No notebooks feed this client yet. Each briefing item and signal links
          to the notebook it came from.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 px-2 pb-2.5 text-left text-[13px]">
            <thead>
              <tr>
                <th scope="col" className={headerCellClassName}>
                  Notebook
                </th>
                <th scope="col" className={headerCellClassName}>
                  Feeds
                </th>
                <th scope="col" className={headerCellClassName}>
                  Last run
                </th>
                <th scope="col" className={headerCellClassName}>
                  Schedule
                </th>
                <th scope="col" className={headerCellClassName}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sources.map(source => {
                const result = results[source.documentId];
                return (
                  <SourceRows
                    key={source.documentId}
                    source={source}
                    isRunning={runningId === source.documentId}
                    isBusy={runningId !== null}
                    result={result}
                    onRun={() => run(source.documentId)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="border-t border-border-secondary px-6 py-3 text-xs text-ink-400">
        Run now runs the notebook as you, so you need edit access to its
        workspace. It does not change what the client sees yet.
      </p>
    </Card>
  );
}

type SourceRowsProps = {
  source: TeamClientSource;
  isRunning: boolean;
  isBusy: boolean;
  result: RunSourceResult | undefined;
  onRun: () => void;
};

function SourceRows({
  source,
  isRunning,
  isBusy,
  result,
  onRun,
}: SourceRowsProps) {
  return (
    <>
      <tr>
        <th scope="row" className={`${cellClassName} font-medium text-ink-100`}>
          <a
            href={webAppUrl(source.path)}
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary-700 dark:hover:text-primary-200"
          >
            {source.title}
          </a>
        </th>
        <td className={`${cellClassName} text-ink-500`}>
          {pluralise(source.items, "item")}
          {source.cells > 0 && (
            <span className="text-ink-400">
              {" "}
              from {pluralise(source.cells, "cell")}
            </span>
          )}
        </td>
        <td className={`${cellClassName} text-ink-500`}>
          {describeLastRun(source)}
        </td>
        <td className={`${cellClassName} text-ink-500`}>
          {describeSchedule(source.schedule)}
        </td>
        <td className={`${cellClassName} text-right`}>
          <Button
            variant="secondary"
            size="sm"
            disabled={isBusy}
            onClick={onRun}
          >
            {isRunning ? "Running…" : "Run now"}
          </Button>
        </td>
      </tr>
      {result && (
        <tr>
          <td colSpan={5} className="px-3 pb-3 pt-0 text-xs">
            <span
              role="status"
              className={
                result.ok && result.run.failed.length === 0
                  ? "text-ink-400"
                  : "text-ink-navy dark:text-ink-200"
              }
            >
              {summary(result)}
            </span>
          </td>
        </tr>
      )}
    </>
  );
}
