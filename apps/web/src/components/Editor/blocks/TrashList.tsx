import Link from "next/link";
import type { List } from "immutable";
import { Map } from "immutable";
import { useMemo } from "react";
import { PiArrowCounterClockwise, PiTrash, PiNotebook } from "react-icons/pi";

import type { ApiDeletedDocument } from "@/types";
import { timeAgo } from "@/lib";
import { StyledCheckbox } from "@/components/StyledCheckbox";

// =====================================
// ⬢ Types
// =====================================

type TrashListProps = {
  workspaceId: string;
  documents: List<ApiDeletedDocument>;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
};

// =====================================
// ⬢ Action Button
// =====================================

interface ActionBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function ActionBtn({ icon, label, onClick, danger }: ActionBtnProps) {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex items-center justify-center w-8 h-8 rounded-lg
          transition-colors duration-100
          ${
            danger
              ? "text-ink-300 dark:text-placeholder-muted hover:text-warning hover:bg-error-tint dark:hover:bg-error-shade"
              : "text-ink-300 dark:text-placeholder-muted hover:text-ink-500 dark:hover:text-ink-200 hover:bg-base-300 dark:hover:bg-white/10"
          }`}
      >
        {icon}
      </button>

      {/* Tooltip */}
      <div
        className="pointer-events-none absolute -top-1 left-1/2
        -translate-y-full -translate-x-1/2
        opacity-0 group-hover:opacity-100 transition-opacity duration-150
        bg-hunter-950 text-white text-[10px] px-2 py-1 rounded-md
        whitespace-nowrap z-20"
      >
        {label}
      </div>
    </div>
  );
}

// =====================================
// ⬢ TrashList
// =====================================

export default function TrashList({
  workspaceId,
  documents,
  selectedIds,
  onToggleSelect,
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
    <ul className="flex flex-col gap-1">
      {sorted.map(doc => {
        // ── Breadcrumb path ──
        const path: string[] = [doc.title || "Untitled"];
        let parent = doc.parentId ? docById.get(doc.parentId) : undefined;
        while (parent) {
          path.push(parent.title || "Untitled");
          parent = parent.parentId ? docById.get(parent.parentId) : undefined;
        }
        path.reverse();

        const displayPath =
          path.length > 2
            ? `${path[0]} / … / ${path[path.length - 1]}`
            : path.join(" / ");

        return (
          <li
            key={doc.id}
            className="group flex items-center gap-3 px-3 py-3.5
              rounded-xl transition-colors duration-100
              hover:bg-primary-tint-50 dark:hover:bg-white/10"
          >
            {/* ── Checkbox ── */}
            <StyledCheckbox
              checked={selectedIds.has(doc.id)}
              onChange={() => onToggleSelect(doc.id)}
              aria-label={`Select ${doc.title || "Untitled"}`}
            />

            {/* ── Icon ── */}
            <div
              className="flex-shrink-0 flex items-center justify-center w-8 h-8
              rounded-lg border border-border dark:border-base-710
              bg-white dark:bg-base-720 text-ink-300 dark:text-placeholder-muted"
            >
              <PiNotebook size={15} />
            </div>

            {/* ── Content ── */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/workspace/${workspaceId}/documents/${doc.id}`}
                className="text-[15px] font-medium text-ink-500 dark:text-ink-200
                  hover:text-primary dark:hover:text-white
                  transition-colors duration-100 truncate block leading-tight"
              >
                {doc.title || "Untitled"}
              </Link>
              <div className="flex items-center gap-1.5 mt-1">
                {path.length > 1 && (
                  <>
                    <span className="text-sm text-ink-300 dark:text-placeholder-muted truncate">
                      {displayPath}
                    </span>
                    <span className="text-sm text-ink-300 dark:text-placeholder-muted">
                      ·
                    </span>
                  </>
                )}
                <span className="text-sm text-ink-300 dark:text-placeholder-muted flex-shrink-0 tabular-nums">
                  Deleted {timeAgo(new Date(doc.deletedAt))}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-0.5">
              <ActionBtn
                icon={<PiArrowCounterClockwise size={15} />}
                onClick={() => onRestore(doc.id)}
              />
              <ActionBtn
                icon={<PiTrash size={15} />}
                onClick={() => onPermanentDelete(doc.id)}
                danger
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
