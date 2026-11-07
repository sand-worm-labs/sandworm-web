import { buttonClassName } from "@sandworm/ui/kit/button";

import type { NotebookSource } from "@/types";

export function SourceNote({ source }: { source: NotebookSource }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 text-xs text-ink-400">
      <span>Snapshot from {source.ranOn}</span>
      {source.notebookUrl && (
        <a
          href={source.notebookUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonClassName({ variant: "link", className: "text-xs" })}
        >
          Open the notebook
        </a>
      )}
    </p>
  );
}
