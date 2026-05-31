import { ascend, sortWith } from "ramda";
import { useDrag, useDrop } from "react-dnd";
import clsx from "clsx";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import ReactDOM from "react-dom";
import type { MouseEventHandler } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PiCaretDown,
  PiCaretRight,
  PiPlus,
  PiDotsThree,
  PiBookmarkSimpleFill,
  PiShareNetwork,
} from "react-icons/pi";
import { List, Stack } from "immutable";
import { getEmptyImage } from "react-dnd-html5-backend";

import type { ApiDocument, UserWorkspaceRole } from "@/types";
import { Trash } from "@/components/Assets/Trash";
import { BookmarkSimple } from "@/components/Assets/BookmarkSimple";
import { Copy } from "@/components/Assets/Copy";

import useDropdownPosition from "../hooks/dropdownposition";

import IconSelector from "./IconSelector";
import ScrollBar from "./ScrollBar";

function useIsDocExpanded(doc: ApiDocument, startsOpen: boolean) {
  const [isExpanded, _setIsExpanded] = useState(
    localStorage.getItem(`sandworm:document:${doc.id}:expanded`) === "1" ||
      startsOpen
  );

  const setIsExpanded = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      _setIsExpanded(prev => {
        const nextValue = typeof value === "function" ? value(prev) : value;

        localStorage.setItem(
          `sandworm:document:${doc.id}:expanded`,
          nextValue ? "1" : "0"
        );

        return nextValue;
      });
    },
    [doc]
  );

  return [isExpanded, setIsExpanded] as const;
}

type Node = {
  document: ApiDocument;
  children: List<Node>;
};

function buildTrees(
  parentId: string | null,
  data: List<ApiDocument>,
  maxDepth: number = 2,
  currentDepth: number = 0
): List<Node> {
  if (currentDepth >= maxDepth) {
    return List([]);
  }

  const children = data.filter(document => document.parentId === parentId);

  const trees = children.map(root => ({
    document: root,
    children: buildTrees(root.id, data, maxDepth, currentDepth + 1),
  }));

  return List(
    sortWith(
      [ascend(t => t.document.orderIndex), ascend(t => t.document.createdAt)],
      trees.toArray()
    )
  );
}

function isDescendant(
  childId: string,
  parentId: string,
  documents: List<ApiDocument>
): boolean {
  const findById = (id: string | null) =>
    id ? documents.find(doc => doc.id === id) : undefined;

  let currentId: string | null = childId;
  while (currentId !== null) {
    const current = findById(currentId);
    if (!current) {
      return false;
    }

    if (current.id === parentId) {
      return true;
    }

    currentId = current.parentId;
  }

  return false;
}

interface Props {
  workspaceId: string;
  current: string;
  documents: List<ApiDocument>;
  role: UserWorkspaceRole;
  onDuplicate: (id: string) => void;
  onSetIcon?: (id: string, icon: string) => void;
  onFavorite: (id: string) => void;
  onUnfavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: (parentId: string) => void;
  onUpdateParent: (
    id: string,
    parentId: string | null,
    orderIndex: number
  ) => void;
  flat?: boolean;
  onBeforeNavigate?: () => void;
}

function computeIsExpanded(current: string, isExpanded: boolean, node: Node) {
  if (current === node.document.id) {
    return isExpanded;
  }

  if (isExpanded) {
    return true;
  }

  let queue = Stack(node.children);
  let head = queue.first();
  queue = queue.shift();
  while (head) {
    if (head.document.id === current) {
      return true;
    }

    queue = queue.push(...head.children.toArray());
    head = queue.first();
    queue = queue.shift();
  }

  return false;
}

type DropDownProps = {
  documentId: string;
  isFavoriteDropdown: boolean;
  isFavorited: boolean;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onFavorite: (id: string) => void;
  onUnfavorite: (id: string) => void;
  onCreate: (parentId: string) => void;
  role: UserWorkspaceRole;
  level: any;
};

function DropDown(props: DropDownProps) {
  const role: UserWorkspaceRole = props.role ?? "viewer";
  const isViewer = role === "viewer";

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { onOpen, dropdownPosition } = useDropdownPosition(buttonRef);

  const onDeleteHandler: MouseEventHandler<HTMLButtonElement> = useCallback(
    e => {
      e.preventDefault();
      props.onDelete(props.documentId);
    },
    [props.onDelete, props.documentId]
  );
  const onDuplicateHandler: MouseEventHandler<HTMLButtonElement> = useCallback(
    () => props.onDuplicate(props.documentId),
    [props.onDuplicate, props.documentId]
  );
  const onFavoriteHandler: MouseEventHandler<HTMLButtonElement> = useCallback(
    () => props.onFavorite(props.documentId),
    [props.onFavorite, props.documentId]
  );
  const onUnfavoriteHandler: MouseEventHandler<HTMLButtonElement> = useCallback(
    () => props.onUnfavorite(props.documentId),
    [props.onUnfavorite, props.documentId]
  );
  const onCreateHandler: MouseEventHandler<HTMLButtonElement> = useCallback(
    e => {
      e.preventDefault();
      props.onCreate(props.documentId);
    },
    [props.onCreate, props.documentId]
  );

  const itemCls = (active: boolean, danger = false) =>
    clsx(
      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg",
      "text-sm font-medium font-body transition-colors text-left",
      danger
        ? "text-ink-400 hover:text-[#D85A30] hover:bg-[#FAECE7] dark:hover:bg-[#1A0D08]"
        : clsx(
            "text-menu-ink-200 dark:text-white",
            active ? "bg-primary/20 text-ink-100" : "hover:bg-primary/20"
          )
    );

  return (
    <>
      <button
        type="button"
        className={clsx(
          (props.isFavoriteDropdown || isViewer || props.level >= 1) &&
            "hidden",
          "pr-0.5"
        )}
        onClick={onCreateHandler}
      >
        <PiPlus
          size={16}
          className="invisible group-hover:visible hover:bg-ceramic-200/50 rounded-md shrink-0"
        />
      </button>

      <Menu as="div" className="relative inline-flex text-left font-body">
        <Menu.Button className="pr-0.5 focus-visible:outline-none" ref={buttonRef} onClick={onOpen}>
          <PiDotsThree
            size={18}
            className="invisible group-hover:visible focus-visible:outline-none hover:bg-ceramic-200/50 rounded-md shrink-0"
          />
        </Menu.Button>

        {ReactDOM.createPortal(
          <Transition
            as="div"
            id="doc-dropdown"
            style={{
              position: "absolute",
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            className="absolute z-[2000]"
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className="absolute left-2 -top-2 z-20 w-44 origin-top-right
                bg-white dark:bg-base-100
                border border-border-tertiary dark:border-border-tertiary
                rounded-2xl
                shadow-sm dark:shadow-none
                focus:outline-none"
            >
              <div className="py-1.5 px-1.5 flex flex-col gap-0.5">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => {}} // TODO: open share modal
                      className={itemCls(active)}
                    >
                      <PiShareNetwork size={16} />
                      <span>Share</span>
                    </button>
                  )}
                </Menu.Item>

                {!isViewer && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={onDuplicateHandler}
                        className={itemCls(active)}
                      >
                        <Copy />
                        <span>Duplicate</span>
                      </button>
                    )}
                  </Menu.Item>
                )}

                {!props.isFavorited && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={onFavoriteHandler}
                        className={itemCls(active)}
                      >
                        <BookmarkSimple />
                        <span>Add to favorites</span>
                      </button>
                    )}
                  </Menu.Item>
                )}

                {props.isFavorited && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={onUnfavoriteHandler}
                        className={itemCls(active)}
                      >
                        <PiBookmarkSimpleFill size={16} />
                        <span>Remove from favorites</span>
                      </button>
                    )}
                  </Menu.Item>
                )}

                {!isViewer && !props.isFavoriteDropdown && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={onDeleteHandler}
                        className={itemCls(active, true)}
                      >
                        <Trash />
                        <span>Delete</span>
                      </button>
                    )}
                  </Menu.Item>
                )}
              </div>
            </Menu.Items>
          </Transition>,
          document.body
        )}
      </Menu>
    </>
  );
}

interface NodeComponentProps {
  workspaceId: string;
  documents: List<ApiDocument>;
  current: string;
  document: ApiDocument;
  descendants: List<Node>;
  role: UserWorkspaceRole;
  onDuplicate: (id: string) => void;
  onSetIcon: (id: string, icon: string) => void;
  onFavorite: (id: string) => void;
  onUnfavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: (id: string) => void;
  onUpdateParent: (
    id: string,
    parentId: string | null,
    orderIndex: number
  ) => void;
  level: number;
  flat?: boolean;
  isLast: boolean;
  firstNonLastParentId: string | null;
  onBeforeNavigate?: () => void;
}

function NodeComponent(props: NodeComponentProps) {
  const role: UserWorkspaceRole = props.role ?? "viewer";
  const isViewer = role === "viewer";

  const [isExpanded, setIsExpanded] = useIsDocExpanded(
    props.document,
    computeIsExpanded(props.current, false, {
      document: props.document,
      children: props.descendants,
    })
  );
  useEffect(() => {
    setIsExpanded(
      computeIsExpanded(props.current, isExpanded, {
        document: props.document,
        children: props.descendants,
      })
    );
  }, [props.current, props.document, props.descendants]);

  const toggleIsExpanded: MouseEventHandler<HTMLButtonElement> = useCallback(
    e => {
      e.preventDefault();
      setIsExpanded(v => !v);
    },
    [setIsExpanded]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [, drag, dragPreview] = useDrag({
    type: "document",
    item: props.document,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !props.flat,
  });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  const [dropHoverState, setDropHoverState] = useState<
    "above" | "below" | "center"
  >("center");

  const [{ isDropping }, drop] = useDrop<
    ApiDocument,
    void,
    { isDropping: boolean }
  >(
    {
      accept: "document",
      drop: (item, monitor): void => {
        if (monitor.didDrop()) {
          return;
        }

        const droppedOnDocument = props.document;
        const droppedDocument = item;

        if (
          isDescendant(
            droppedOnDocument.id,
            droppedDocument.id,
            props.documents
          )
        ) {
          return;
        }

        if (dropHoverState === "center") {
          if (props.level >= 1) {
            console.warn("Cannot nest more than 2 levels deep");
            return;
          }
          props.onUpdateParent(item.id, droppedOnDocument.id, -1);
          return;
        }

        if (dropHoverState === "above") {
          props.onUpdateParent(
            item.id,
            droppedOnDocument.parentId,
            droppedOnDocument.orderIndex
          );
          return;
        }

        props.onUpdateParent(
          item.id,
          droppedOnDocument.parentId,
          droppedOnDocument.orderIndex + 1
        );
      },
      canDrop: item => !props.flat && item.id !== props.document.id,
      hover: (_item, monitor) => {
        if (!linkRef.current || !containerRef.current) {
          return;
        }
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) {
          setDropHoverState("center");
          return;
        }

        const componentRect =
          isExpanded && props.descendants.size === 0
            ? containerRef.current.getBoundingClientRect()
            : linkRef.current.getBoundingClientRect();
        const hoverClientY = clientOffset.y - componentRect.top;

        if (hoverClientY < componentRect.height / 3) {
          setDropHoverState("above");
        } else if (hoverClientY > (2 * componentRect.height) / 3) {
          setDropHoverState("below");
        } else {
          setDropHoverState("center");
        }
      },
      collect: monitor => ({
        isDropping:
          monitor.isOver({ shallow: true }) &&
          monitor.getItem().id !== props.document.id,
      }),
    },
    [
      props.document.id,
      props.onUpdateParent,
      setIsExpanded,
      linkRef,
      isExpanded,
      dropHoverState,
      props.documents,
      props.isLast,
      props.firstNonLastParentId,
    ]
  );

  return (
    <li
      className="relative"
      key={props.document.id}
      ref={li => {
        drop(li);
      }}
    >
      <div
        ref={docDiv => {
          drag(docDiv);
        }}
      >
        <div ref={containerRef}>
          {isDropping &&
            (dropHoverState === "above" || dropHoverState === "center") && (
              <div className="absolute top-0 left-0 w-full h-1 bg-ceramic-200" />
            )}
          {isDropping &&
            (dropHoverState === "below" || dropHoverState === "center") && (
              <div
                className="absolute left-0 w-full h-1 bg-ceramic-200"
                style={{
                  top: isExpanded
                    ? containerRef.current?.offsetHeight
                    : linkRef.current?.offsetHeight,
                }}
              />
            )}
          <div
            className={clsx(
              props.document.id === props.current
                ? "text-ink-100 bg-ceramic-100/50"
                : "text-ink-400 hover:bg-ceramic-100/80",
              isDropping &&
                dropHoverState === "center" &&
                "bg-ceramic-200 border-ceramic-200",
              "group text-[13.5px] font-normal leading-6 w-full flex py-1 rounded-sm hover:text-ceramic-600"
            )}
            style={{
              paddingLeft: `${props.level}rem`,
            }}
            ref={linkRef}
          >
            <div className="w-full flex items-center justify-between pr-1.5 gap-x-1 pl-4">
              <div
                className={clsx("flex items-center", { "pl-1": props.flat })}
              >
                {!props.flat &&
                  (props.descendants.size > 0 || props.level < 1) && (
                    <button
                      type="button"
                      className="hover:bg-ceramic-200 rounded-md p-0.5 flex items-center justify-center"
                      onClick={toggleIsExpanded}
                    >
                      {isExpanded ? (
                        <PiCaretDown size={14} />
                      ) : (
                        <PiCaretRight size={14} />
                      )}
                    </button>
                  )}
                <IconSelector
                  workspaceId={props.workspaceId}
                  documentId={props.document.id}
                  disabled={isViewer}
                  isChild={props.level > 0}
                />
              </div>
              <Link
                onClick={props.onBeforeNavigate}
                className="flex items-center flex-1 overflow-auto"
                href={`/workspace/${props.workspaceId}/documents/${props.document.id}`}
              >
                <span className={clsx("truncate", props.level > 0 && "italic")}>
                  {props.document.title || "Untitled"}
                </span>
              </Link>
              <DropDown
                documentId={props.document.id}
                isFavoriteDropdown={Boolean(props.flat)}
                isFavorited={props.document.isFavorite || props.flat}
                onDelete={props.onDelete}
                onDuplicate={props.onDuplicate}
                onFavorite={props.onFavorite}
                onUnfavorite={props.onUnfavorite}
                role={props.role ?? "viewer"}
                onCreate={props.onCreate}
                level={props.level}
              />
            </div>
          </div>
          {isExpanded && (
            <ul
              className={clsx(
                isDropping &&
                  dropHoverState === "center" &&
                  "bg-ceramic-200 border-ceramic-200",
                "space-y-1"
              )}
            >
              {props.descendants.size === 0 && (
                <li
                  className="text-ink-400 text-sm font-medium leading-6 py-1 rounded-sm pointer-events-none overflow-auto truncate italic"
                  style={{ paddingLeft: `${props.level + 3}rem` }}
                >
                  No documents inside
                </li>
              )}
              {props.descendants.map((node, i) => {
                const isLast = i === props.descendants.size - 1;
                return (
                  <NodeComponent
                    key={node.document.id}
                    workspaceId={props.workspaceId}
                    current={props.current}
                    document={node.document}
                    descendants={node.children}
                    role={props.role}
                    onDuplicate={props.onDuplicate}
                    onSetIcon={props.onSetIcon}
                    onFavorite={props.onFavorite}
                    onUnfavorite={props.onUnfavorite}
                    onDelete={props.onDelete}
                    onCreate={props.onCreate}
                    onUpdateParent={props.onUpdateParent}
                    level={props.level + 1}
                    documents={props.documents}
                    isLast={isLast}
                    firstNonLastParentId={
                      isLast ? props.firstNonLastParentId : props.document.id
                    }
                  />
                );
              })}
            </ul>
          )}
        </div>
      </div>
      {props.isLast && props.level === 0 && <div className="h-10" />}
    </li>
  );
}

function DocumentTree(props: Props) {
  const trees = useMemo(
    () =>
      props.flat
        ? props.documents.map(d => ({
            document: d,
            children: List<Node>(),
          }))
        : buildTrees(null, props.documents),
    [props.flat, props.documents]
  );

  return (
    <ScrollBar>
      <ul className="space-y-1 max-h-[25rem] overflow-y-auto py-2">
        {trees.map((node, i) => {
          const isLast = i === trees.size - 1;
          return (
            <NodeComponent
              key={node.document.id}
              workspaceId={props.workspaceId}
              current={props.current}
              document={node.document}
              descendants={node.children}
              role={props.role}
              onDuplicate={props.onDuplicate}
              onSetIcon={props.onSetIcon}
              onFavorite={props.onFavorite}
              onUnfavorite={props.onUnfavorite}
              onDelete={props.onDelete}
              onCreate={props.onCreate}
              onUpdateParent={props.onUpdateParent}
              level={0}
              flat={props.flat}
              documents={props.documents}
              isLast={isLast}
              onBeforeNavigate={props.onBeforeNavigate}
              firstNonLastParentId={isLast ? null : node.document.id}
            />
          );
        })}
      </ul>
    </ScrollBar>
  );
}

export default DocumentTree;
