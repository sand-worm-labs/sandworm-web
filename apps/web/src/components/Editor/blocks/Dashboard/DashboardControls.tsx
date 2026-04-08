/* eslint-disable import/no-cycle */
import type * as Y from "yjs";
import {
  Bars3CenterLeftIcon,
  ChartPieIcon,
  CircleStackIcon,
  CommandLineIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/solid";
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
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Heading1Icon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import SimpleBar from "simplebar-react";

import type { ApiDocument } from "@/types";
import VisualizationV2Block from "@/components/Visualization/index";

import { useYDocState } from "../../hooks/useYDocs";
import type { APIDataSources } from "../../hooks/useDataSources";
import MultiSelect from "../MultiSelect";

import ScaleChild from "./ScaleChild";
import { getDefaults } from "./DashboardView";

import type { DraggingBlock } from ".";

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
    case BlockType.FileUpload:
      return "File Upload";
    case BlockType.DashboardHeader:
      return "Dashboard Header";
    default:
      return "";
  }
}

function getTypeIcon(t: BlockType): JSX.Element {
  switch (t) {
    case BlockType.VisualizationV2:
    case BlockType.Visualization:
      return <ChartPieIcon className="w-4 h-4 text-ink-400 " />;
    case BlockType.Python:
      return <CommandLineIcon className="w-4 h-4 text-ink-400 " />;
    case BlockType.SQL:
      return <CircleStackIcon className="w-4 h-4 text-ink-400 " />;
    case BlockType.PivotTable:
      return <TableCellsIcon className="w-4 h-4 text-ink-400 " />;
    case BlockType.Input:
    case BlockType.DateInput:
    case BlockType.DropdownInput:
      return <PencilSquareIcon className="w-4 h-4 text-ink-400 " />;
    case BlockType.RichText:
      return <Bars3CenterLeftIcon className="w-4 h-4 text-ink-400 " />;
    case BlockType.FileUpload:
    case BlockType.DashboardHeader:
    default:
      return <QuestionMarkCircleIcon className="w-4 h-4 text-ink-400 " />;
  }
}

const typeOptions = [
  BlockType.VisualizationV2,
  BlockType.Python,
  BlockType.SQL,
  BlockType.PivotTable,
  BlockType.Input,
];

interface BlockPreviewProps {
  document: ApiDocument;
  dataframes: Y.Map<DataFrame>;
  block: YBlock;
  blocks: Y.Map<YBlock>;
  userId: string | null;
  executionQueue: ExecutionQueue;
}

function BlockPreview(props: BlockPreviewProps) {
  return switchBlockType(props.block, {
    onRichText: () => <div className="w-full h-96" />,
    onSQL: () => (
      <div className="w-full h-64">
        <div className="w-full h-96" />
      </div>
    ),
    onPython: () => <div className="w-full h-96" />,
    onVisualization: block => (
      <div className="w-full h-96">
        <VisualizationV2Block
          document={props.document}
          dataframes={props.dataframes}
          block={block}
          blocks={props.blocks}
          dragPreview={null}
          isEditable={false}
          onAddGroupedBlock={() => {}}
          dashboardMode={{ _tag: "editing", position: "sidebar" }}
          isPublicMode={false}
          hasMultipleTabs={false}
          isBlockHiddenInPublished={false}
          onToggleIsBlockHiddenInPublished={() => {}}
          isCursorWithin={false}
          isCursorInserting={false}
          userId={props.userId}
          executionQueue={props.executionQueue}
          isFullScreen
        />
      </div>
    ),
    onVisualizationV2: block => (
      <div className="w-full h-96">
        <VisualizationV2Block
          document={props.document}
          dataframes={props.dataframes}
          block={block}
          blocks={props.blocks}
          dragPreview={null}
          isEditable={false}
          onAddGroupedBlock={() => {}}
          dashboardMode={{ _tag: "editing", position: "sidebar" }}
          isPublicMode={false}
          hasMultipleTabs={false}
          isBlockHiddenInPublished={false}
          onToggleIsBlockHiddenInPublished={() => {}}
          isCursorWithin={false}
          isCursorInserting={false}
          userId={props.userId}
          executionQueue={props.executionQueue}
          isFullScreen
        />
      </div>
    ),
    onInput: () => <div className="w-full h-96" />,
    onDropdownInput: () => <div className="w-full h-96" />,
    onFileUpload: () => null,
    onDateInput: () => <div className="w-full h-96" />,
    onPivotTable: () => (
      <div className="w-full h-96">
        <div className="w-full h-96" />
      </div>
    ),
    onDashboardHeader: () => null,
    onPowerToolbox: () => null,
  });
}

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

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData("text/plain", id);

      const width = blockRef.current?.offsetWidth ?? 0;
      const height = blockRef.current?.offsetHeight ?? 0;
      props.onDragStart({ id, type, width, height });

      const dragImage = document.createElement("div");
      dragImage.className = "shadow-md bg-base-100 rounded-md overflow-hidden";
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
    [id, type, props.onDragStart, blockRef.current]
  );

  const blockTitle = props.block.getAttribute("title");

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
      case BlockType.PowerToolbox:
        return;
      default:
        exhaustiveCheck(type);
    }
  }, [props.onExpand, props.block, type]);

  return (
    <div
      key={id}
      className={clsx(
        "border border-border-secondary hover:border-ceramic-200 rounded-md bg-base-100 relative p-2 overflow-x-hidden select-none",
        props.className
      )}
      draggable
      onDragStart={onDragStart}
      onPointerUp={onPointerUp}
    >
      <div className="flex flex-col gap-y-6">
        <span className="text-ink-400 text-md font-medium">
          {blockTitle || "Untitled"}
        </span>
        <ScaleChild
          width={768}
          disableScale={
            props.block.getAttribute("type") === BlockType.VisualizationV2
          }
        >
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
      </div>

      {/* add a transparent div to prevent any interaction with the block */}
      <div className="absolute top-0 bottom-0 left-0 right-0 z-10 group hover:bg-ceramic-100/50 hover:cursor-grab">
        <div className="flex items-center justify-center text-center text-ceramic-600 w-full h-full text-md invisible group-hover:visible font-medium">
          drag to dashboard or click to expand
        </div>
      </div>
    </div>
  );
}

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
  return props.list.map((block, i) => {
    const { id } = getBaseAttributes(block);

    return (
      <BlockListItem
        className={clsx("mt-6", i === props.list.length - 1 && "mb-6")}
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
  const onToggleType = useCallback(
    (t: BlockType) => {
      setTypes(currentTypes => {
        if (currentTypes.includes(t)) {
          return currentTypes.filter(type => type !== t);
        }

        return [...currentTypes, t];
      });
    },
    [types]
  );

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
                  if (!types.includes(BlockType.Visualization)) {
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
                case BlockType.RichText:
                case BlockType.FileUpload:
                case BlockType.DashboardHeader:
                case BlockType.PowerToolbox:
                  // these do not show up in the list in the first place
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
      <div className="pt-3 fixed right-0">
        <button
          type="button"
          onClick={props.onOpen}
          className="bg-white dark:bg-base-100  flex items-center rounded-l-sm px-3 py-1 text-sm text-ink-400  hover:bg-gray-100 border border-r-0 border-border-secondary group max-w-11 hover:max-w-32 overflow-hidden transition-mw group duration-500"
        >
          <ChevronDoubleLeftIcon className="min-w-3 min-h-3" />
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
            Show Blocks
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-[400px] font-body  h-full">
      <button
        type="button"
        className="absolute z-10 top-12 transform rounded-full border border-gray-300 text-ink-400 bg-white dark:bg-base-100  hover:bg-ceramic-200 hover:border-ceramic-200 hover:text-ceramic-400 w-6 h-6 flex justify-center items-center left-0 -translate-x-1/2 dark:border-border-tertiary"
        onClick={props.onClose}
      >
        <ChevronDoubleRightIcon className="w-3 h-3" />
      </button>

      <div className="bg-white dark:bg-base-100  border-l border-border-secondary dark:border-border-tertiary overflow-y-auto relative h-full flex flex-col justify-between">
        <div className="bg-gray-50  dark:bg-base-100  border-b dark:border-border-tertiary  border-border-secondary py-6 px-4 shadow-sm">
          <h2 className=" text-lg font-medium text-ink-100 dark:text-white pb-4">
            Blocks
          </h2>
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Find block by title"
                className="block w-full rounded-md border-0 pl-7 py-2 text-ink-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-ink-400 focus:ring-2 focus:ring-inset outline-none  focus:ring-primary text-xs h-[38px]"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute top-1 left-2 w-4 h-4 text-ink-400 translate-y-1/2" />
            </div>
            <MultiSelect<BlockType>
              value={types}
              getLabel={getTypeLabel}
              getIcon={getTypeIcon}
              placeholder="Filter by type"
              options={typeOptions}
              onToggle={onToggleType}
            />
          </div>
        </div>
        <SimpleBar className="px-3 h-full overflow-y-auto no-scroll">
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
        </SimpleBar>
        <div className="bg-gray-50 dark:bg-base-100  dark:border-border-tertiary p-4 border-t border-border-secondary">
          <button
            type="button"
            className="flex items-center rounded-md px-3 py-2 text-sm text-ink-400 hover:bg-gray-100 border dark:border-border-tertiary border-border-secondary disabled:cursor-not-allowed disabled:opacity-50 gap-x-2 w-full dark:bg-base-100   bg-base-100 shadow-sm justify-center"
            onClick={addHeading}
          >
            <Heading1Icon strokeWidth={1} className="w-4 h-4" />
            <span>Add heading</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardControls;
