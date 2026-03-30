import type * as Y from "yjs";
import type {
  AITasks,
  ExecutionQueue,
  YBlock,
  YBlockGroup,
} from "@sandworm/editor";
import {
  BlockType,
  getBlocks,
  getDataframes,
  getLayout,
  switchBlockType,
} from "@sandworm/editor";
import { useCallback, useEffect, useState } from "react";
import type GridLayout from "react-grid-layout";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { DataFrame } from "@sandworm/types";

import type { ApiDocument } from "@/types";

import { useYDocState } from "../../hooks/useYDocs";
import type { APIDataSources } from "../../hooks/useDataSources";
import RichTextBlock from "../customBlocks/richText";
// eslint-disable-next-line import/no-cycle
import SQLBlock from "../customBlocks/sql";
import VisualizationBlock from "../../index";
import PythonBlock from "../customBlocks/python";
import InputBlock from "../customBlocks/input";
import DropdownInputBlock from "../customBlocks/dropdownInput";
import DashboardHeader from "../customBlocks/dashboardHeader";
import DateInputBlock from "../customBlocks/dateInput";
import PivotTableBlock from "../customBlocks/pivotTable";

interface Props {
  item: GridLayout.Layout;
  block: YBlock | null;
  onDelete: (id: string) => void;
  yDoc: Y.Doc;
  document: ApiDocument;
  dataSources: APIDataSources;
  isEditingDashboard: boolean;
  latestBlockId: string | null;
  userId: string | null;
  executionQueue: ExecutionQueue;
  aiTasks: AITasks;
  onExpand: (block: YBlock) => void;
}

const NO_TITLE_BLOCKS = [
  BlockType.Input,
  BlockType.DropdownInput,
  BlockType.FileUpload,
  BlockType.RichText,
  BlockType.DashboardHeader,
];

interface GridBlockRendererProps {
  block: YBlock;
  item: GridLayout.Layout;
  document: ApiDocument;
  dataSources: APIDataSources;
  dataframes: Y.Map<DataFrame>;
  blocks: Y.Map<YBlock>;
  yLayout: Y.Array<YBlockGroup>;
  isEditingDashboard: boolean;
  isEditingHeader: boolean;
  onFinishEditingHeader: () => void;
  onStartEditingHeader: () => void;
  userId: string | null;
  executionQueue: ExecutionQueue;
  aiTasks: AITasks;
}

function GridBlockRenderer(props: GridBlockRendererProps) {
  return switchBlockType(props.block, {
    onRichText: block => (
      <RichTextBlock
        block={block}
        belongsToMultiTabGroup={false}
        isEditable={false}
        dragPreview={null}
        dashboardMode={
          props.isEditingDashboard
            ? { _tag: "editing", position: "dashboard" }
            : { _tag: "live" }
        }
        isCursorWithin={false}
        isCursorInserting={false}
      />
    ),
    onSQL: block => (
      <SQLBlock
        block={block}
        layout={props.yLayout}
        blocks={props.blocks}
        document={props.document}
        dataSources={props.dataSources}
        isEditable={false}
        dragPreview={null}
        isPublicMode={false}
        dashboardMode={
          props.isEditingDashboard
            ? { _tag: "editing", position: "dashboard" }
            : { _tag: "live" }
        }
        hasMultipleTabs={false}
        isBlockHiddenInPublished={false}
        onToggleIsBlockHiddenInPublished={() => {}}
        onSchemaExplorer={() => {}}
        insertBelow={() => {}}
        userId={props.userId}
        executionQueue={props.executionQueue}
        aiTasks={props.aiTasks}
        isFullScreen
      />
    ),
    onPython: block => (
      <PythonBlock
        key={`${props.item.i}-${props.item.w}-${props.item.h}`}
        document={props.document}
        block={block}
        blocks={props.blocks}
        isEditable={false}
        dragPreview={null}
        isPDF={false}
        dashboardMode={
          props.isEditingDashboard
            ? { _tag: "editing", position: "dashboard" }
            : { _tag: "live" }
        }
        isPublicMode={false}
        hasMultipleTabs={false}
        isBlockHiddenInPublished={false}
        onToggleIsBlockHiddenInPublished={() => {}}
        userId={props.userId}
        executionQueue={props.executionQueue}
        aiTasks={props.aiTasks}
        isFullScreen
      />
    ),
    onVisualization: block => (
      <VisualizationBlock
        document={props.document}
        dataframes={props.dataframes}
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        isEditable={false}
        onAddGroupedBlock={() => {}}
        dashboardMode={
          props.isEditingDashboard
            ? { _tag: "editing", position: "dashboard" }
            : { _tag: "live" }
        }
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
    ),
    onVisualizationV2: () => null,
    onPivotTable: block => (
      <PivotTableBlock
        workspaceId={props.document.workspaceId}
        dataframes={props.dataframes}
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        isEditable={false}
        onAddGroupedBlock={() => {}}
        dashboardMode={
          props.isEditingDashboard
            ? { _tag: "editing", position: "dashboard" }
            : { _tag: "live" }
        }
        hasMultipleTabs={false}
        isBlockHiddenInPublished={false}
        onToggleIsBlockHiddenInPublished={() => {}}
        isCursorWithin={false}
        isCursorInserting={false}
        userId={props.userId}
        executionQueue={props.executionQueue}
        isFullScreen
      />
    ),
    onInput: block => (
      <InputBlock
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        belongsToMultiTabGroup={false}
        isEditable={!props.isEditingDashboard}
        isApp
        dashboardMode={
          props.isEditingDashboard
            ? { _tag: "editing", position: "dashboard" }
            : { _tag: "live" }
        }
        isCursorWithin={false}
        isCursorInserting={false}
        userId={props.userId}
        workspaceId={props.document.workspaceId}
        executionQueue={props.executionQueue}
      />
    ),
    onDropdownInput: block => (
      <DropdownInputBlock
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        belongsToMultiTabGroup={false}
        isEditable={!props.isEditingDashboard}
        isApp
        dataframes={props.dataframes}
        dashboardMode={
          props.isEditingDashboard
            ? { _tag: "editing", position: "dashboard" }
            : { _tag: "live" }
        }
        isCursorWithin={false}
        isCursorInserting={false}
        userId={props.userId}
        workspaceId={props.document.workspaceId}
        executionQueue={props.executionQueue}
      />
    ),
    onDateInput: block => (
      <DateInputBlock
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        belongsToMultiTabGroup={false}
        isEditable={!props.isEditingDashboard}
        isApp
        dashboardMode={
          props.isEditingDashboard
            ? { _tag: "editing", position: "dashboard" }
            : { _tag: "live" }
        }
        isCursorWithin={false}
        isCursorInserting={false}
        userId={props.userId}
        workspaceId={props.document.workspaceId}
        executionQueue={props.executionQueue}
      />
    ),
    onDashboardHeader: block => (
      <DashboardHeader
        block={block}
        isEditing={props.isEditingHeader}
        onFinishedEditing={props.onFinishEditingHeader}
        dashboardMode={props.isEditingDashboard ? "editing" : "live"}
        onStartEditing={props.onStartEditingHeader}
      />
    ),
    onFileUpload: () => null,
    onWriteback: () => null,
  });
}

function GridElement(props: Props) {
  const { state: blocks } = useYDocState(props.yDoc, getBlocks);
  const { state: dataframes } = useYDocState(props.yDoc, getDataframes);
  const { state: yLayout } = useYDocState(props.yDoc, getLayout);

  const [isEditingHeader, setIsEditingHeader] = useState(false);

  // set editing when adding a new block to the dashboard
  useEffect(() => {
    if (props.latestBlockId === props.block?.getAttribute("id")) {
      setIsEditingHeader(true);
    }
  }, [props.latestBlockId, props.block?.getAttribute("id")]);

  const onDelete = useCallback(() => {
    props.onDelete(props.item.i);
  }, [props.onDelete, props.item.i]);

  const blockType = props.block?.getAttribute("type");
  const originalTitle = props.block?.getAttribute("title") ?? "";
  const titleContent = originalTitle || "Untitled";

  const hasTitle =
    blockType &&
    !NO_TITLE_BLOCKS.includes(blockType) &&
    originalTitle.trim() !== "";

  return (
    <div
      className={clsx(
        "relative group h-full",
        props.isEditingDashboard && "cursor-grab"
      )}
    >
      {props.block ? (
        <div
          className={clsx(
            "w-full h-full rounded-md overflow-hidden flex flex-col",
            props.isEditingDashboard &&
              blockType !== BlockType.DashboardHeader &&
              "pointer-events-none"
          )}
        >
          {hasTitle && (
            <h2 className="text-gray-700 font-medium text-left text-sm truncate min-h-6 px-3.5 py-2.5">
              {titleContent}
            </h2>
          )}

          <div className="h-full overflow-hidden">
            {props.block && (
              <GridBlockRenderer
                block={props.block}
                item={props.item}
                document={props.document}
                dataSources={props.dataSources}
                dataframes={dataframes.value}
                blocks={blocks.value}
                yLayout={yLayout.value}
                isEditingDashboard={props.isEditingDashboard}
                isEditingHeader={isEditingHeader}
                onFinishEditingHeader={() => setIsEditingHeader(false)}
                onStartEditingHeader={() => setIsEditingHeader(true)}
                userId={props.userId}
                executionQueue={props.executionQueue}
                aiTasks={props.aiTasks}
              />
            )}{" "}
          </div>
        </div>
      ) : (
        <div className="bg-gray-200 overflow-hidden">{props.item.i}</div>
      )}

      {props.isEditingDashboard && (
        <div
          role="presentation"
          className={clsx(
            "absolute -top-3 right-3 opacity-0 bg-white group-hover:opacity-100 z-20 border border-border-secondary dark:border-border-tertiary py-1 rounded-md shadow-sm flex gap-x-3.5 items-center px-3.5"
          )}
          onMouseDown={e => e.stopPropagation()}
        >
          <button
            type="button"
            className="flex items-center jutify-center cursor-pointer text-ink-400  hover:text-primary-600 h-4 w-4 text-xs bg-white"
            onClick={() => {
              if (blockType === BlockType.DashboardHeader) {
                setIsEditingHeader(!isEditingHeader);
              } else if (props.block) {
                props.onExpand(props.block);
              }
            }}
          >
            <PencilIcon />
          </button>

          <button
            type="button"
            className="flex items-center jutify-center cursor-pointer text-ink-400  hover:text-red-600 h-4 w-4 text-xs bg-white"
            onClick={onDelete}
          >
            <TrashIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default GridElement;
