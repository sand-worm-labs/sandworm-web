import type * as Y from "yjs";
import type { AITasks, ExecutionQueue, YBlock } from "@sandworm/editor";
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
import type { ApiDocument } from "@sandworm/database";
import clsx from "clsx";

import { useYDocState } from "@/hooks/useYDoc";
import type { APIDataSources } from "@/hooks/useDatasources";

import RichTextBlock from "../v2Editor/customBlocks/richText";
import SQLBlock from "../v2Editor/customBlocks/sql";
import VisualizationBlock from "../v2Editor/customBlocks/visualization";
import PythonBlock from "../v2Editor/customBlocks/python";
import InputBlock from "../v2Editor/customBlocks/input";
import DropdownInputBlock from "../v2Editor/customBlocks/dropdownInput";
import DashboardHeader from "../v2Editor/customBlocks/dashboardHeader";
import DateInputBlock from "../v2Editor/customBlocks/dateInput";
import PivotTableBlock from "../v2Editor/customBlocks/pivotTable";
import VisualizationV2Block from "../../../Visualization";

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

  const renderItem = useCallback(
    (block: YBlock, item: GridLayout.Layout) =>
      switchBlockType(block, {
        onVisualization: block => (
          return (
            <VisualizationBlock
              document={props.document}
              dataframes={dataframes.value}
              block={block}
              blocks={blocks.value}
              dragPreview={null}
              isEditable={false}
              onAddGroupedBlock={() => {}}
              isDashboard
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
          ) as null;
        },
        onVisualizationV2: block => {
          return (
            <VisualizationV2Block
              document={props.document}
              dataframes={dataframes.value}
              block={block}
              blocks={blocks.value}
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
          ) as null;
        },

        onDashboardHeader: block => {
          return (
            <DashboardHeader
              block={block}
              isEditing={isEditingHeader}
              onFinishedEditing={() => setIsEditingHeader(false)}
              dashboardMode={props.isEditingDashboard ? "editing" : "live"}
              onStartEditing={() => setIsEditingHeader(true)}
            />
          ) as null;
        },
        onFileUpload: () => null,
        onWriteback: () => null,
      }),
    [
      props.document,
      props.dataSources,
      dataframes,
      blocks,
      yLayout,
      props.isEditingDashboard,
      isEditingHeader,
      props.userId,
      props.executionQueue,
    ]
  );

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
            {renderItem(props.block, props.item)}
          </div>
        </div>
      ) : (
        <div className="bg-gray-200 overflow-hidden">{props.item.i}</div>
      )}

      {props.isEditingDashboard && (
        <div
          className={clsx(
            "absolute -top-3 right-3 opacity-0 bg-white group-hover:opacity-100 z-20 border border-gray-200 py-1 rounded-md shadow-sm flex gap-x-3.5 items-center px-3.5"
          )}
          onMouseDown={e => e.stopPropagation()}
        >
          <button
            className="flex items-center jutify-center cursor-pointer text-gray-500 hover:text-primary-600 h-4 w-4 text-xs bg-white"
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
            className="flex items-center jutify-center cursor-pointer text-gray-500 hover:text-red-600 h-4 w-4 text-xs bg-white"
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
