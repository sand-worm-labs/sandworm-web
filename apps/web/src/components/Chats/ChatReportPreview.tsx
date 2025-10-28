"use client";
import * as Y from "yjs";
import {
  YBlock,
  ExecutionQueue,
  ExecutionQueueBatch,
  DataFrame,
} from "@sandworm/types";
import {
  BlockType,
  ExecutionQueueItem,
  VisualizationV2Block,
} from "@sandworm/editor";
import VisualizationBlockV2 from "../Visualization";
import { Star, Expand, MoreVertical } from "lucide-react";
import ItemActionsDropdown from "./ItemAction";
import RichTextBlock from "../Visualization/blocks/customBlocks/richText";

const yDoc = new Y.Doc();

// --- Create a visualization block ---
const visualizationBlock = new Y.XmlElement(
  "visualization"
) as Y.XmlElement<VisualizationV2Block>;

visualizationBlock.setAttribute("type", BlockType.VisualizationV2);
visualizationBlock.setAttribute("id", "visualization");
visualizationBlock.setAttribute("title", "Top Tokens Chart");
visualizationBlock.setAttribute("input", {
  chartType: "groupedColumn",
  dataframeName: "num1 ",
  xAxis: null,
  xAxisName: null,
  xAxisSort: null,
  xAxisGroupFunction: null,
  xAxisDateFormat: null,
  xAxisNumberFormat: null,
  yAxes: [],
  filters: [],
  histogramFormat: "count",
  histogramBin: { type: "auto" },
  dataLabels: null,
});

// --- Add mock data inside the element ---
const dataElement = new Y.XmlElement("data");
dataElement.setAttribute("xField", "token");
dataElement.setAttribute("yField", "volume");
dataElement.setAttribute("color", "#0C7CE8");

const sampleData = new Y.XmlText();
const data = [
  { token: "WETH", volume: 523000 },
  { token: "USDC", volume: 310000 },
  { token: "AERO", volume: 125000 },
  { token: "DEGEN", volume: 78000 },
];
sampleData.insert(0, JSON.stringify(data));

dataElement.insert(0, [sampleData]);
visualizationBlock.insert(0, [dataElement]);

// --- Set up blocks map ---
const blocks = yDoc.getMap<YBlock>("blocks");
blocks.set("visualization", visualizationBlock as YBlock);

// --- Set up dataframes map (mock one for query_1) ---
const dataframes = yDoc.getMap<DataFrame>("dataframes");

const query1Frame = {
  name: "query_1",
  blockId: "07dba87c-d847-4c83-b1c9-51d77a208a24",
  columns: [
    { name: "token", type: "string" },
    { name: "volume", type: "int32" },
  ],
  rows: data.map(item => [item.token, item.volume]),
};

dataframes.set("query_1", query1Frame as DataFrame);

// --- ExecutionQueue ---
const executionQueue: ExecutionQueue = {
  blocks: new Y.Map<YBlock>(),
  queue: new Y.Array(),
  layout: new Y.Array(),
  observers: new Set(),
  options: {},
  enqueueBlock: () => {},
  enqueueBlockGroup: () => {},
  enqueueBlockOnwards: () => {},
  enqueueRunAll: (): ExecutionQueueBatch => ({
    id: "batch-1",
    status: "pending",
    timestamp: Date.now(),
  }),
  getCurrentBatch: () => null,
  advance: () => {},
  getBlockExecutions: () => [],
  observe: () => () => {},
  toJSON: () => [],
  getRunAllBatches: () => [],
  length: 0,
  onObservation: () => {},
  getExecutionQueueMetadataForBlock: () => ({
    status: "pending",
    timestamp: Date.now(),
  }),
};

// --- Document info ---
const document = {
  appClock: 0,
  appId: "c9eda31f-0a6a-408f-b217-1948b73b4b1b",
  clock: 0,
  createdAt: "2025-10-05T13:41:16.642Z",
  deletedAt: null,
  hasDashboard: true,
  icon: "DocumentIcon",
  id: "0ad689b1-252b-4ada-88b7-71ba3e27c5a9",
  title: "Test Notebook",
  updatedAt: "2025-10-14T20:31:01.941Z",
};

// --- Preview component ---
export const ChatReportPreview = () => {
  return (
    <div className="w-full max-h-[95vh] p-6 flex flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-black font-semibold">
          Tokens on Base - Bar chart
        </h2>

        <div className="flex items-center gap-3 text-neutral-400">
          <Star className="w-4 h-4 cursor-pointer hover:text-yellow-400 transition-colors" />
          <Expand className="w-4 h-4 cursor-pointer hover:text-neutral-200 transition-colors" />
          <ItemActionsDropdown />
        </div>
      </div>

      <p className="text-[#050818] text-base leading-relaxed ">
        This dashboard visualizes the most actively traded tokens on Base over
        the past 30 days. The data highlights on-chain volume trends, unique
        holder growth, and the top projects driving activity within the Base
        ecosystem.
      </p>

{/*       <RichTextBlock
        block={blocks}
        belongsToMultiTabGroup={false}
        isEditable={false}
        dragPreview={null}
        dashboardMode={{ _tag: "editing", position: "sidebar" }}
        isCursorWithin={false}
        isCursorInserting={false}
      /> */}

      <div className="w-full flex items-center justify-center text-neutral-500 rounded-2xl relative pt-5">
        <VisualizationBlockV2
          isPublicMode={false}
          isEditable={false}
          document={document}
          onAddGroupedBlock={() => {}}
          block={
            blocks.get("visualization") as Y.XmlElement<VisualizationV2Block>
          }
          blocks={blocks}
          dataframes={dataframes}
          dragPreview={null}
          dashboardMode={null}
          hasMultipleTabs={false}
          isBlockHiddenInPublished={false}
          onToggleIsBlockHiddenInPublished={() => {}}
          isCursorWithin={false}
          isCursorInserting={false}
          userId="default-user"
          executionQueue={executionQueue}
          isFullScreen={false}
        />
      </div>

      <p className="text-[#050818] text-base leading-relaxed ">
        This dashboard visualizes the most actively traded tokens on Base over
        the past 30 days. The data highlights on-chain volume trends, unique
        holder growth, and the top projects driving activity within the Base
        ecosystem.
      </p>

      <p className="text-[#050818] text-base leading-relaxed ">
        This dashboard visualizes the most actively traded tokens on Base over
        the past 30 days. The data highlights on-chain volume trends, unique
        holder growth, and the top projects driving activity within the Base
        ecosystem.
      </p>
    </div>
  );
};
