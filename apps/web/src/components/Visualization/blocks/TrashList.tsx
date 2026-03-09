import { ArrowUturnUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { List } from "immutable";
import { Map } from "immutable";
import { useMemo } from "react";

import type { ApiDeletedDocument } from "@/types";
import { Trash } from "@/components/Assets/Trash";
import { timeAgo } from "@/lib";

type TrashListProps = {
  workspaceId: string;
  documents: List<ApiDeletedDocument>;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
};

export default function TrashList({
  workspaceId,
  documents,
  onRestore,
  onPermanentDelete,
}: TrashListProps) {
  const docById: Map<string, ApiDeletedDocument> = useMemo(
    () => documents.reduce((acc, doc) => acc.set(doc.id, doc), Map()),
    [documents]
  );
  const sorted = useMemo(
    () => documents.sortBy(d => d.deletedAt).reverse(),
    [documents]
  );

  return (
    <ul className="divide-y divide-border-tertiary">
      {sorted.map(doc => {
        const path: string[] = [doc.title || "Untitled"];
        let parent = doc.parentId ? docById.get(doc.parentId) : undefined;
        while (parent) {
          path.push(parent.title || "Untitled");
          parent = parent.parentId ? docById.get(parent.parentId) : undefined;
        }
        path.reverse();

        const displayPath =
          path.length > 2
            ? `${path[0]} / ... / ${path[path.length - 1]}`
            : path.join(" / ");

        return (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap"
          >
            <div>
              <p className="text-sm font-semibold leading-6 text-ink-100">
                <Link
                  href={`/workspace/${workspaceId}/documents/${doc.id}`}
                  className="hover:underline"
                >
                  {doc.title || "Untitled"}
                </Link>
              </p>
              <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-ink-400">
                <p>{displayPath}</p>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <p>Deleted {timeAgo(new Date(doc.deletedAt))}</p>
              </div>
            </div>

            <dl className="flex items-center justify-center gap-x-2 sm:w-auto px-2">
              <div className="group relative">
                <button
                  type="button"
                  className="flex p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => onRestore(doc.id)}
                >
                  <ArrowUturnUpIcon className="h-5 w-5 text-ink-400" />
                </button>
                <div className="pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1">
                  <span className="inline-flex gap-x-1 items-center text-white text-center">
                    <span>Restore</span>
                  </span>
                </div>
              </div>

              <div className="group relative">
                <button
                  type="button"
                  className="flex p-2 hover:bg-gray-100 rounded-sm"
                  onClick={() => onPermanentDelete(doc.id)}
                >
                  <Trash className="h-5 w-5 text-ink-400" />
                </button>
                <div className="pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1">
                  <span className="inline-flex gap-x-1 justify-center items-center text-white text-center">
                    <span>Delete permanently</span>
                  </span>
                </div>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
