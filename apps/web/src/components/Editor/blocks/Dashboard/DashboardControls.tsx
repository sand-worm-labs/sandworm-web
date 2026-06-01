/* eslint-disable import/no-cycle */
import type * as Y from "yjs";
import type {
  AITasks,
  ExecutionQueue,
  YBlock,
  YBlockGroup,
} from "@sandworm/editor";
import {
  BlockType,
  addDashboardItemToYDashboard,
  addDashboardOnlyBlock,
  getBaseAttributes,
  getBlocks,
  getDashboard,
  getDashboardItem,
  getDataframes,
  getLayout,
  getPythonBlockResult,
  getSQLAttributes,
  switchBlockType,
} from "@sandworm/editor";
import { useCallback, useMemo, useRef, useState } from "react";
import type { DataFrame } from "@sandworm/types";
import { exhaustiveCheck } from "@sandworm/types";
import {
  PiCaretDoubleLeft,
  PiCaretDoubleRight,
  PiChartPie,
  PiTerminal,
  PiDatabase,
  PiTable,
  PiTextbox,
  PiTextAlignLeft,
  PiMagnifyingGlass,
  PiTextHOne,
  PiX,
  PiListBullets,
  PiCalendar,
  PiDotsSixVertical,
  PiMarkdownLogo,
} from "react-icons/pi";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import type { ApiDocument } from "@/types";
import VisualizationV2Block from "@/components/Visualization/index";

import MarkdownBlock from "../customBlocks/markdown";
import { useYDocState } from "../../hooks/useYDocs";
import type { APIDataSources } from "../../hooks/useDataSources";
import MultiSelect from "../MultiSelect";

import ScaleChild from "./ScaleChild";
import { getDefaults } from "./DashboardView";

import type { DraggingBlock } from ".";

// =====================================
// ⬢ Block type labels & icons
// =====================================
function getTypeLabel(t: BlockType) {
  switch (t) {
    case BlockType.VisualizationV2:
    case BlockType.Visualization:
      return "Visualization";
    case BlockType.Python:
      return "Python output";
    case BlockType.SQL:
      return "Query results";
    case BlockType.PivotTable:
      return "Pivot table";
    case BlockType.Input:
    case BlockType.DateInput:
    case BlockType.DropdownInput:
      return "Input";
    case BlockType.RichText:
      return "Rich Text";
    case BlockType.Markdown:
      return "Markdown";
    case BlockType.FileUpload:
      return "File Upload";
    case BlockType.DashboardHeader:
      return "Dashboard Header";
    default:
      return "";
  }
}

function getTypeIcon(t: BlockType, size = 14) {
  const className = "text-ink-300 dark:text-ink-500";
  switch (t) {
    case BlockType.VisualizationV2:
    case BlockType.Visualization:
      return <PiChartPie size={size} className={className} />;
    case BlockType.Python:
      return <PiTerminal size={size} className={className} />;
    case BlockType.SQL:
      return <PiDatabase size={size} className={className} />;
    case BlockType.PivotTable:
      return <PiTable size={size} className={className} />;
    case BlockType.Input:
      return <PiTextbox size={size} className={className} />;
    case BlockType.DropdownInput:
      return <PiListBullets size={size} className={className} />;
    case BlockType.DateInput:
      return <PiCalendar size={size} className={className} />;
    case BlockType.RichText:
      return <PiTextAlignLeft size={size} className={className} />;
    case BlockType.Markdown:
      return <PiMarkdownLogo size={size} className={className} />;
    default:
      return <PiTextbox size={size} className={className} />;
  }
}

const typeOptions = [
  BlockType.VisualizationV2,
  BlockType.Python,
  BlockType.SQL,
  BlockType.PivotTable,
  BlockType.Input,
  BlockType.Markdown,
];

// =====================================
// ⬢ Placeholder visuals (until real previews)
// =====================================
function PlaceholderBars({ rows, cols = 4 }: { rows: number; cols?: number }) {
  return (
    <div
      className="grid gap-1 w-full max-w-[148px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows * cols }, (_, i) => (
        <div
          key={`cell-${rows}-${cols}-${i}`}
          className="h-1.5 rounded-sm bg-[#DEE2E6] dark:bg-[#3A3A38]"
        />
      ))}
    </div>
  );
}

function BlockPlaceholderVisual({ type }: { type: BlockType }) {
  switch (type) {
    case BlockType.SQL:
    case BlockType.PivotTable:
      return (
        <PlaceholderBars
          rows={3}
          cols={type === BlockType.PivotTable ? 3 : 4}
        />
      );
    case BlockType.Python:
      return (
        <div className="flex flex-col gap-1 w-full max-w-[148px]">
          {[100, 72, 88].map(w => (
            <div
              key={w}
              className="h-1.5 rounded-sm bg-[#DEE2E6] dark:bg-[#3A3A38]"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      );
    case BlockType.Input:
      return (
        <div className="w-full max-w-[148px] h-7 rounded-md border border-[#DEE2E6] dark:border-[#3A3A38] bg-white dark:bg-[#252523] px-2 flex items-center">
          <div className="h-1.5 w-16 rounded-sm bg-[#E9ECEF] dark:bg-[#3A3A38]" />
        </div>
      );
    case BlockType.DropdownInput:
      return (
        <div className="w-full max-w-[148px] h-7 rounded-md border border-[#DEE2E6] dark:border-[#3A3A38] bg-white dark:bg-[#252523] px-2 flex items-center justify-between">
          <div className="h-1.5 w-12 rounded-sm bg-[#E9ECEF] dark:bg-[#3A3A38]" />
          <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-ink-300" />
        </div>
      );
    case BlockType.DateInput:
      return (
        <div className="w-full max-w-[148px] h-7 rounded-md border border-[#DEE2E6] dark:border-[#3A3A38] bg-white dark:bg-[#252523] px-2 flex items-center gap-1.5">
          <PiCalendar
            size={12}
            className="text-ink-300 dark:text-ink-500 flex-shrink-0"
          />
          <div className="h-1.5 flex-1 rounded-sm bg-[#E9ECEF] dark:bg-[#3A3A38]" />
        </div>
      );
    case BlockType.RichText:
      return (
        <div className="flex flex-col gap-1.5 w-full max-w-[148px]">
          <div className="h-2 w-20 rounded-sm bg-[#CED4DA] dark:bg-[#4A4A48]" />
          <div className="h-1.5 w-full rounded-sm bg-[#E9ECEF] dark:bg-[#3A3A38]" />
          <div className="h-1.5 w-[85%] rounded-sm bg-[#E9ECEF] dark:bg-[#3A3A38]" />
        </div>
      );
    case BlockType.Markdown:
      return (
        <div className="flex flex-col gap-1 w-full max-w-[148px] font-mono text-[9px] text-ink-300">
          <div className="h-1.5 w-14 rounded-sm bg-[#7B2FBE]/30" />
          <div className="h-1.5 w-full rounded-sm bg-[#E9ECEF] dark:bg-[#3A3A38]" />
          <div className="h-1.5 w-[70%] rounded-sm bg-[#2E9E5B]/25" />
        </div>
      );
    default:
      return <PlaceholderBars rows={2} cols={3} />;
  }
}

function BlockTypePlaceholder({ type }: { type: BlockType }) {
  return (
    <div
      className="flex flex-col items-center justify-center w-full h-32 gap-2 rounded-lg
        bg-[#F8F9FA] dark:bg-[#1E1E1C]
        border border-dashed border-[#DEE2E6] dark:border-[#3A3A38] p-3"
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg border border-[#DEE2E6] dark:border-[#3A3A38]
          bg-white dark:bg-[#252523] flex items-center justify-center"
      >
        {getTypeIcon(type, 16)}
      </div>
      <BlockPlaceholderVisual type={type} />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-300 dark:text-ink-600">
        {getTypeLabel(type)}
      </span>
    </div>
  );
}

// =====================================
// ⬢ Block preview
// =====================================
interface BlockPreviewProps {
  document: ApiDocument;
  dataframes: Y.Map<DataFrame>;
  block: YBlock;
  blocks: Y.Map<YBlock>;
  userId: string | null;
  executionQueue: ExecutionQueue;
}

const vizPreviewProps = (props: BlockPreviewProps) => ({
  document: props.document,
  dataframes: props.dataframes,
  blocks: props.blocks,
  dragPreview: null,
  isEditable: false as const,
  onAddGroupedBlock: () => {},
  dashboardMode: { _tag: "editing" as const, position: "sidebar" as const },
  isPublicMode: false,
  hasMultipleTabs: false,
  isBlockHiddenInPublished: false,
  onToggleIsBlockHiddenInPublished: () => {},
  isCursorWithin: false,
  isCursorInserting: false,
  userId: props.userId,
  executionQueue: props.executionQueue,
  isFullScreen: true,
});

const markdownPreviewProps = (props: BlockPreviewProps) => ({
  document: props.document,
  belongsToMultiTabGroup: false,
  isEditable: false as const,
  dragPreview: null,
  dashboardMode: { _tag: "editing" as const, position: "sidebar" as const },
  isCursorWithin: false,
  isCursorInserting: false,
  workspaceId: props.document.workspaceId,
});

function BlockPreview(props: BlockPreviewProps) {
  return switchBlockType(props.block, {
    onRichText: () => <BlockTypePlaceholder type={BlockType.RichText} />,
    onSQL: () => <BlockTypePlaceholder type={BlockType.SQL} />,
    onPython: () => <BlockTypePlaceholder type={BlockType.Python} />,
    onVisualization: block => (
      <div className="w-full h-48 overflow-hidden rounded-lg border border-[#E9ECEF] dark:border-[#3A3A38]">
        <VisualizationV2Block block={block} {...vizPreviewProps(props)} />
      </div>
    ),
    onVisualizationV2: block => (
      <div className="w-full h-48 overflow-hidden rounded-lg border border-[#E9ECEF] dark:border-[#3A3A38]">
        <VisualizationV2Block block={block} {...vizPreviewProps(props)} />
      </div>
    ),
    onInput: () => <BlockTypePlaceholder type={BlockType.Input} />,
    onDropdownInput: () => (
      <BlockTypePlaceholder type={BlockType.DropdownInput} />
    ),
    onFileUpload: () => null,
    onDateInput: () => <BlockTypePlaceholder type={BlockType.DateInput} />,
    onPivotTable: () => <BlockTypePlaceholder type={BlockType.PivotTable} />,
    onMarkdown: block => (
      <div className="w-full h-48 overflow-hidden rounded-lg border border-[#E9ECEF] dark:border-[#3A3A38]">
        <MarkdownBlock block={block} {...markdownPreviewProps(props)} />
      </div>
    ),
    onDashboardHeader: () => null,
    onPowerToolbox: () => null,
  });
}

// =====================================
// ⬢ Block list item
// =====================================
interface BlockListItemProps {
  document: ApiDocument;
  dataframes: Y.Map<DataFrame>;
  block: YBlock;
  blocks: Y.Map<YBlock>;
  onDragStart: (draggingBlock: DraggingBlock) => void;
  userId: string | null;
  executionQueue: ExecutionQueue;
  onExpand: (block: YBlock) => void;
  className?: string;
}

function BlockListItem(props: BlockListItemProps) {
  const { id, type } = getBaseAttributes(props.block);
  const blockRef = useRef<HTMLDivElement>(null);
  const blockTitle = props.block.getAttribute("title");

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData("text/plain", id);

      const width = blockRef.current?.offsetWidth ?? 0;
      const height = blockRef.current?.offsetHeight ?? 0;
      props.onDragStart({ id, type, width, height });

      const dragImage = document.createElement("div");
      dragImage.className =
        "shadow-lg bg-white dark:bg-[#252523] rounded-xl overflow-hidden border border-[#E9ECEF]";
      dragImage.style.position = "absolute";
      dragImage.style.top = "-1000px";
      dragImage.style.left = "-1000px";
      dragImage.style.width = `${width}px`;
      dragImage.style.height = `${height}px`;
      dragImage.style.zIndex = "9999";
      dragImage.style.pointerEvents = "none";
      dragImage.innerHTML = blockRef.current?.innerHTML ?? "";
      document.body.appendChild(dragImage);

      event.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },
    [id, type, props.onDragStart]
  );

  const onPointerUp = useCallback(() => {
    switch (type) {
      case BlockType.Visualization:
      case BlockType.VisualizationV2:
      case BlockType.SQL:
      case BlockType.Input:
      case BlockType.DropdownInput:
      case BlockType.DateInput:
      case BlockType.PivotTable:
      case BlockType.Python:
      case BlockType.RichText:
      case BlockType.FileUpload:
      case BlockType.DashboardHeader:
      case BlockType.Markdown:
      case BlockType.PowerToolbox:
        return;
      default:
        exhaustiveCheck(type);
    }
  }, [type]);

  return (
    <div
      key={id}
      className={clsx(
        "group relative rounded-xl border border-[#E9ECEF] dark:border-[#2A2A28]",
        "bg-white dark:bg-[#252523] p-3 overflow-hidden select-none",
        "transition-colors duration-100 hover:border-[#D9A8F8] dark:hover:border-[#7A06B8]",
        props.className
      )}
      draggable
      onDragStart={onDragStart}
      onPointerUp={onPointerUp}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="flex-shrink-0 flex items-center justify-center w-7 h-7
            rounded-lg border border-[#DEE2E6] dark:border-[#3A3A38]
            bg-[#F8F9FA] dark:bg-[#1E1E1C]"
        >
          {getTypeIcon(type)}
        </div>
        <span className="flex-1 min-w-0 text-[12.5px] font-medium text-ink-500 dark:text-ink-200 truncate">
          {blockTitle || "Untitled"}
        </span>
      </div>

      <ScaleChild width={768} disableScale={type === BlockType.VisualizationV2}>
        <div className="overflow-hidden" ref={blockRef}>
          <BlockPreview
            document={props.document}
            dataframes={props.dataframes}
            block={props.block}
            blocks={props.blocks}
            userId={props.userId}
            executionQueue={props.executionQueue}
          />
        </div>
      </ScaleChild>

      <div
        className="absolute inset-0 z-10 rounded-xl flex items-center justify-center
          bg-white/60 dark:bg-[#252523]/70 opacity-0 group-hover:opacity-100
          transition-opacity duration-150 cursor-grab active:cursor-grabbing"
      >
        <div className="flex flex-col items-center gap-1.5 px-3 text-center">
          <PiDotsSixVertical size={18} className="text-[#A308F0]" />
          <span className="text-[11px] font-medium text-ink-500 dark:text-ink-300">
            Drag to dashboard
          </span>
        </div>
      </div>
    </div>
  );
}

// =====================================
// ⬢ Blocks list
// =====================================
interface BlocksListProps {
  document: ApiDocument;
  dataSources: APIDataSources;
  dataframes: Y.Map<DataFrame>;
  list: YBlock[];
  blocks: Y.Map<YBlock>;
  layout: Y.Array<YBlockGroup>;
  onDragStart: (draggingBlock: DraggingBlock) => void;
  userId: string | null;
  executionQueue: ExecutionQueue;
  aiTasks: AITasks;
  onExpand: (block: YBlock) => void;
}

function BlocksList(props: BlocksListProps) {
  if (props.list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 px-4">
        <PiDatabase size={20} className="text-ink-200 dark:text-ink-600" />
        <p className="text-[12px] text-ink-300 dark:text-ink-500 text-center">
          No blocks match your filters
        </p>
      </div>
    );
  }

  return props.list.map((block, i) => {
    const { id } = getBaseAttributes(block);

    return (
      <BlockListItem
        className={clsx(i > 0 && "mt-3", i === props.list.length - 1 && "mb-4")}
        key={id}
        document={props.document}
        dataframes={props.dataframes}
        block={block}
        blocks={props.blocks}
        onDragStart={props.onDragStart}
        userId={props.userId}
        executionQueue={props.executionQueue}
        onExpand={props.onExpand}
      />
    );
  });
}

// =====================================
// ⬢ Dashboard controls
// =====================================
interface Props {
  document: ApiDocument;
  dataSources: APIDataSources;
  yDoc: Y.Doc;
  onDragStart: (draggingBlock: DraggingBlock) => void;
  onAddBlock: (blockId: string) => void;
  userId: string | null;
  executionQueue: ExecutionQueue;
  aiTasks: AITasks;
  onExpand: (block: YBlock) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function DashboardControls(props: Props) {
  const { state: dataframes } = useYDocState(props.yDoc, getDataframes);
  const { state: blocks } = useYDocState(props.yDoc, getBlocks);
  const { state: layout } = useYDocState(props.yDoc, getLayout);
  const { state: dashboard } = useYDocState(props.yDoc, getDashboard);
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<BlockType[]>([]);

  const onToggleType = useCallback((t: BlockType) => {
    setTypes(currentTypes =>
      currentTypes.includes(t)
        ? currentTypes.filter(type => type !== t)
        : [...currentTypes, t]
    );
  }, []);

  const blocksInDashboard = useMemo(
    () =>
      new Set(
        Array.from(dashboard.value.values()).map(i => i.getAttribute("blockId"))
      ),
    [dashboard]
  );

  const addHeading = useCallback(() => {
    const blockId = addDashboardOnlyBlock(blocks.value, {
      type: BlockType.DashboardHeader,
      content: "",
    });

    const lastRow = Array.from(dashboard.value.values()).reduce<number>(
      (last, yItem) => {
        const itemId = yItem.getAttribute("id");
        if (!itemId) {
          return last;
        }

        const item = getDashboardItem(dashboard.value, itemId);
        return Math.max(last, item?.y ?? 0);
      },
      0
    );

    addDashboardItemToYDashboard(dashboard.value, {
      id: uuidv4(),
      blockId,
      x: 0,
      y: lastRow + 1,
      w: 24,
      h: 1,
      ...getDefaults(BlockType.DashboardHeader),
    });

    props.onAddBlock(blockId);
  }, [blocks, dashboard, props.onAddBlock]);

  const blocksList = useMemo(
    () =>
      layout.value
        .map(blockGroup => {
          const groupBlocks =
            blockGroup.getAttribute("tabs")?.map(tab => {
              const id = tab.getAttribute("id");
              if (!id || blocksInDashboard.has(id)) {
                return null;
              }

              const block = blocks.value.get(id);
              if (!block) {
                return null;
              }

              return switchBlockType(block, {
                onRichText: () => block,
                onSQL: sBlock => {
                  const { result } = getSQLAttributes(sBlock, blocks.value);
                  if (!result) {
                    return null;
                  }

                  return block;
                },
                onPython: pBlock => {
                  const results = getPythonBlockResult(pBlock);
                  if (results.length === 0) {
                    return null;
                  }

                  return block;
                },
                onVisualization: () => block,
                onVisualizationV2: () => block,
                onInput: () => block,
                onDropdownInput: () => block,
                onDateInput: () => block,
                onPivotTable: () => block,
                onFileUpload: () => null,
                onDashboardHeader: () => null,
                onMarkdown: () => block,
                onPowerToolbox: () => null,
              });
            }) ?? [];

          return groupBlocks.filter((block): block is YBlock => {
            if (block === null) {
              return false;
            }

            const attrs = getBaseAttributes(block);
            if (types.length > 0) {
              switch (attrs.type) {
                case BlockType.Visualization:
                case BlockType.VisualizationV2:
                  if (
                    !types.includes(BlockType.VisualizationV2) &&
                    !types.includes(BlockType.Visualization)
                  ) {
                    return false;
                  }
                  break;
                case BlockType.Python:
                  if (!types.includes(BlockType.Python)) {
                    return false;
                  }
                  break;
                case BlockType.SQL:
                  if (!types.includes(BlockType.SQL)) {
                    return false;
                  }
                  break;
                case BlockType.Input:
                case BlockType.DateInput:
                case BlockType.DropdownInput:
                  if (!types.includes(BlockType.Input)) {
                    return false;
                  }
                  break;
                case BlockType.PivotTable:
                  if (!types.includes(BlockType.PivotTable)) {
                    return false;
                  }
                  break;
                case BlockType.Markdown:
                  if (!types.includes(BlockType.Markdown)) {
                    return false;
                  }
                  break;
                case BlockType.RichText:
                case BlockType.FileUpload:
                case BlockType.DashboardHeader:
                case BlockType.PowerToolbox:
                  break;
                default:
                  exhaustiveCheck(attrs.type);
              }
            }

            const s = search.trim();
            if (s === "") {
              return true;
            }

            const title = attrs.title.trim();
            return title.toLowerCase().includes(s.toLowerCase());
          });
        })
        .flat(),
    [blocks, layout, blocksInDashboard, search, types]
  );

  if (!props.isOpen) {
    return (
      <div className="pt-3 fixed right-0 z-20">
        <button
          type="button"
          onClick={props.onOpen}
          className="bg-white dark:bg-[#252523] flex items-center rounded-l-xl px-3 py-1.5
            text-[12.5px] text-ink-400 hover:bg-[#F9F5FF] dark:hover:bg-[#1A0D26]
            border border-r-0 border-[#E9ECEF] dark:border-[#3A3A38]
            group max-w-11 hover:max-w-32 overflow-hidden transition-[max-width] duration-300"
        >
          <PiCaretDoubleLeft size={14} className="flex-shrink-0" />
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Show Blocks
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-[400px] font-body h-full">
      <button
        type="button"
        className="absolute z-10 top-12 rounded-full border border-[#E9ECEF] dark:border-[#3A3A38]
          text-ink-400 bg-white dark:bg-[#252523]
          hover:bg-[#F9F5FF] dark:hover:bg-[#1A0D26] hover:text-[#A308F0]
          w-6 h-6 flex justify-center items-center left-0 -translate-x-1/2
          transition-colors duration-100"
        onClick={props.onClose}
        aria-label="Close blocks panel"
      >
        <PiCaretDoubleRight size={14} />
      </button>

      <div
        className="bg-white dark:bg-[#252523] border-l border-[#E9ECEF] dark:border-[#2A2A28]
          overflow-hidden relative h-full flex flex-col"
      >
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-[#F1F3F4] dark:border-[#2A2A28]">
          <h2 className="text-[13px] font-medium text-ink-100 dark:text-white mb-3">
            Blocks
          </h2>
          <div className="flex flex-col gap-2.5">
            <div
              className="flex items-center gap-2 px-2.5 py-1.5
                bg-[#F1F3F4] dark:bg-[#2A2A28]
                border border-transparent
                focus-within:border-[#D9A8F8] dark:focus-within:border-[#7A06B8]
                rounded-xl transition-colors duration-150"
            >
              <PiMagnifyingGlass
                size={13}
                className="text-ink-300 dark:text-ink-600 flex-shrink-0"
              />
              <input
                type="text"
                placeholder="Find block by title…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[12.5px]
                  text-ink-500 dark:text-ink-200
                  placeholder:text-ink-300 dark:placeholder:text-ink-600"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-ink-300 hover:text-ink-500 transition-colors"
                  aria-label="Clear search"
                >
                  <PiX size={12} />
                </button>
              ) : null}
            </div>
            <MultiSelect<BlockType>
              value={types}
              getLabel={getTypeLabel}
              getIcon={t => getTypeIcon(t, 13)}
              placeholder="Filter by type"
              options={typeOptions}
              onToggle={onToggleType}
            />
          </div>
        </div>

        <OverlayScrollbarsComponent className="flex-1 min-h-0 px-3 pt-2 overflow-y-auto">
          <BlocksList
            document={props.document}
            list={blocksList}
            dataSources={props.dataSources}
            dataframes={dataframes.value}
            blocks={blocks.value}
            layout={layout.value}
            onDragStart={props.onDragStart}
            userId={props.userId}
            executionQueue={props.executionQueue}
            aiTasks={props.aiTasks}
            onExpand={props.onExpand}
          />
        </OverlayScrollbarsComponent>

        <div className="flex-shrink-0 p-3 border-t border-[#F1F3F4] dark:border-[#2A2A28]">
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full rounded-xl px-3 py-2
              text-[12.5px] font-medium text-ink-500 dark:text-ink-200
              border border-[#E9ECEF] dark:border-[#3A3A38]
              bg-white dark:bg-[#1E1E1C]
              hover:bg-[#F9F5FF] dark:hover:bg-[#1A0D26]
              transition-colors duration-100"
            onClick={addHeading}
          >
            <PiTextHOne size={15} className="text-ink-300 dark:text-ink-500" />
            <span>Add heading</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardControls;
