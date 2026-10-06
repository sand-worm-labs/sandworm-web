import type * as Y from "yjs";
import type { DashboardHeaderBlock } from "@sandworm/editor";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  block: Y.XmlElement<DashboardHeaderBlock>;
  isEditing: boolean;
  onFinishedEditing: () => void;
  dashboardMode: "editing" | "live";
  onStartEditing: () => void;
}
function DashboardHeader(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  // `content` is a plain string attribute (not a Y.Text bound to an editor),
  // so unlike markdown/pivot_table it never re-renders on its own when
  // changed from elsewhere (e.g. the AI regenerating it via
  // upsertDashboardHeaderBlock) — force one on every Yjs change to this block.
  const [, forceRerender] = useState(0);

  useEffect(() => {
    const onUpdate = () => forceRerender(v => v + 1);
    props.block.observe(onUpdate);
    return () => props.block.unobserve(onUpdate);
  }, [props.block]);

  const onEdit = useCallback(() => {
    props.block.setAttribute("content", inputRef.current?.value ?? "");
  }, [props.block]);

  useEffect(() => {
    if (props.isEditing) {
      inputRef.current?.focus();
    }
  }, [props.isEditing]);

  const endEditing = useCallback(() => {
    onEdit();
    props.onFinishedEditing();
  }, [onEdit, props.onFinishedEditing]);

  let content = props.block.getAttribute("content");
  const hasContent = content !== "";
  if (props.dashboardMode === "live" && !content) {
    content = "";
  } else if (!content) {
    content = "Heading";
  }

  const onClickH1 = useCallback(
    (e: React.MouseEvent) => {
      if (props.dashboardMode === "live") {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      props.onStartEditing();
    },
    [props.dashboardMode, props.onStartEditing]
  );

  const stopPropagation = useCallback(
    (e: React.MouseEvent) => {
      if (props.dashboardMode === "live") {
        return;
      }

      e.stopPropagation();
    },
    [props.dashboardMode]
  );

  // A section divider: the title, then a hairline running to the edge. It sits
  // at the bottom of its row so it reads as belonging to the tiles below it.
  return (
    <div className="h-full flex items-end px-0.5 pb-1.5">
      <div className="flex w-full min-w-0 items-center gap-4">
        {props.isEditing ? (
          <input
            ref={inputRef}
            onKeyDown={e => {
              if (e.key === "Enter") {
                onEdit();
                props.onFinishedEditing();
              }
            }}
            type="text"
            value={props.block.getAttribute("content")}
            placeholder="Heading"
            className="block w-full rounded-md border-0 text-ink-100 placeholder:text-ink-400 focus:ring-0 text-lg font-semibold leading-7 bg-transparent px-0 py-0"
            onChange={e => props.block.setAttribute("content", e.target.value)}
            onBlur={endEditing}
            onMouseDown={stopPropagation}
          />
        ) : (
          <>
            <button
              type="button"
              className={clsx(
                "min-w-0 truncate text-left text-lg font-semibold leading-7",
                hasContent ? "text-ink-100" : "text-ink-400",
                props.dashboardMode !== "live" && "hover:cursor-text"
              )}
              onClick={onClickH1}
              onMouseDown={stopPropagation}
            >
              {content}
            </button>
            {content && (
              <div
                aria-hidden
                className="h-px flex-1 bg-border dark:bg-border-tertiary"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardHeader;
