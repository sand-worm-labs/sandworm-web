"use client";

import * as Y from "yjs";
import {
  makeVisualizationV2Block,
  VisualizationV2BlockInput,
  getDefaultDateFormat,
  getDefaultNumberFormat,
  ExecutionQueue,
  BlockType,
  ExecutionQueueItem,
} from "@sandworm/editor";
import type { DataFrame, DataFrameColumn } from "@sandworm/types";
import { v4 as uuidv4 } from "uuid";
import type { VisualizationV2Block } from "@sandworm/editor";
import { Star, Expand, MoreVertical } from "lucide-react";

import VisualizationBlockV2 from "../Visualization";
import RichTextBlock from "../Visualization/blocks/customBlocks/richText";

import ItemActionsDropdown from "./ItemAction";

const doc = new Y.Doc();

// 2. Create mock DataFrame
const mockDataframe: DataFrame = {
  name: "sales_data",
  columns: [
    {
      name: "date",
      type: "datetime64[ns]",
      categories: null,
    } as DataFrameColumn,
    {
      name: "revenue",
      type: "float64",
      categories: null,
    } as DataFrameColumn,
    {
      name: "region",
      type: "str",
      categories: ["North", "South", "East", "West"],
    } as DataFrameColumn,
  ],
  updatedAt: new Date().toISOString(),
  blockId: null,
};

// 3. Add dataframe to the doc
const dataframes = doc.getMap<DataFrame>("dataframes");
dataframes.set("sales_data", mockDataframe);

// 4. Create the visualization block
const blockId = uuidv4();
const blocks = doc.getMap("blocks");

const visualizationBlock = makeVisualizationV2Block(blockId, {
  dataframeName: "sales_data",
  chartType: "line",
  xAxis: mockDataframe.columns[0], // date column
  xAxisName: "Date",
  xAxisSort: "ascending",
  xAxisGroupFunction: "month",
  xAxisDateFormat: getDefaultDateFormat(),
  xAxisNumberFormat: null,
  yAxes: [
    {
      id: uuidv4(),
      name: "Revenue",
      series: [
        {
          id: uuidv4(),
          column: mockDataframe.columns[1], // revenue column
          aggregateFunction: "sum",
          groupBy: null,
          chartType: null,
          name: "Total Revenue",
          color: "#5470c6",
          groups: null,
          dateFormat: getDefaultDateFormat(),
          numberFormat: getDefaultNumberFormat(),
        },
      ],
    },
  ],
  filters: [],
  histogramFormat: "count",
  histogramBin: { type: "auto" },
  dataLabels: {
    show: false,
    frequency: "some",
  },
});

// 5. Set the output with mock chart data
visualizationBlock.setAttribute("output", {
  executedAt: new Date().toISOString(),
  tooManyDataPoints: false,
  result: {
    tooltip: { trigger: "axis" },
    legend: {},
    grid: { containLabel: true },
    dataset: [
      {
        dimensions: ["date", uuidv4()], // series id
        source: [
          { date: "2024-01-01", [uuidv4()]: 1000 },
          { date: "2024-02-01", [uuidv4()]: 1500 },
          { date: "2024-03-01", [uuidv4()]: 1200 },
          { date: "2024-04-01", [uuidv4()]: 1800 },
          { date: "2024-05-01", [uuidv4()]: 2000 },
        ],
      },
    ],
    xAxis: [
      {
        type: "time",
        name: "Date",
        nameLocation: "middle",
        nameGap: 30,
        axisPointer: { type: "shadow" },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Revenue",
        nameLocation: "middle",
        nameGap: 50,
        position: "left",
      },
    ],
    series: [
      {
        id: uuidv4(),
        type: "line",
        datasetIndex: 0,
        yAxisIndex: 0,
        name: "Total Revenue",
        z: 0,
        encode: { x: "date", y: uuidv4() },
        lineStyle: { color: "#5470c6" },
        itemStyle: { color: "#5470c6" },
      },
    ],
  },
});

blocks.set(blockId, visualizationBlock);

// 6. Create layout and block group
const layout = doc.getArray("layout");
const blockGroupId = uuidv4();
const blockGroup = new Y.XmlElement("block-group");
blockGroup.setAttribute("id", blockGroupId);

const tabRef = new Y.XmlElement("block-ref");
tabRef.setAttribute("id", blockId);

const tabs = new Y.Array();
tabs.push([tabRef]);

blockGroup.setAttribute("tabs", tabs);
blockGroup.setAttribute("current", tabRef.clone());
layout.push([blockGroup]);

// 7. Create execution queue
const executionQueue = doc.getArray("executionQueue");

// Now you can use these in your component
const mockProps = {
  document: { id: "doc-1", workspaceId: "ws-1" } as any,
  dataframes,
  block: visualizationBlock,
  blocks,
  dragPreview: null,
  isEditable: true,
  isPublicMode: false,
  onAddGroupedBlock: () => {},
  dashboardMode: null,
  hasMultipleTabs: false,
  isBlockHiddenInPublished: false,
  onToggleIsBlockHiddenInPublished: () => {},
  isCursorWithin: true,
  isCursorInserting: false,
  executionQueue: ExecutionQueue.fromYjs(doc),
  userId: "user-1",
  isFullScreen: false,
};

// --- Preview component ---
export const ChatReportPreview = () => {
  return (
    <div className="w-full max-h-[95vh] p-6 flex flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl text-black dark:text-white font-semibold">
          Tokens on Base - Bar chart
        </h2>

        <div className="flex items-center gap-3 text-neutral-400">
          <Star className="w-4 h-4 cursor-pointer hover:text-yellow-400 transition-colors" />
          <Expand className="w-4 h-4 cursor-pointer hover:text-neutral-200 transition-colors" />
          <ItemActionsDropdown />
        </div>
      </div>

      <p className="text-[#050818] text-base leading-relaxed dark:text-white ">
        This dashboard visualizes the most actively traded tokens on Base over
        the past 30 days. The data highlights on-chain volume trends, unique
        holder growth, and the top projects driving activity within the Base
        ecosystem.
      </p>

      <div className="w-full flex items-center justify-center text-neutral-500 rounded-2xl relative pt-5">
        <VisualizationBlockV2 {...mockProps} />
      </div>

      <p className="text-[#050818] dark:text-white text-base leading-relaxed ">
        This dashboard visualizes the most actively traded tokens on Base over
        the past 30 days. The data highlights on-chain volume trends, unique
        holder growth, and the top projects driving activity within the Base
        ecosystem.
      </p>

      <p className="text-[#050818] dark:text-white text-base leading-relaxed ">
        This dashboard visualizes the most actively traded tokens on Base over
        the past 30 days. The data highlights on-chain volume trends, unique
        holder growth, and the top projects driving activity within the Base
        ecosystem.
      </p>
    </div>
  );
};
