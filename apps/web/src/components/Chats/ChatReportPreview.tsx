"use client";

import * as Y from "yjs";
import type {
  YBlock,
  ExecutionQueue,
  ExecutionQueueBatch,
  DataFrame,
} from "@sandworm/types";

import type { VisualizationV2Block } from "@sandworm/editor";
import { BlockType, ExecutionQueueItem } from "@sandworm/editor";
import { Star, Expand, MoreVertical } from "lucide-react";

import VisualizationBlockV2 from "../Visualization";
import RichTextBlock from "../Visualization/blocks/customBlocks/richText";

import ItemActionsDropdown from "./ItemAction";

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

// --- Mock Yjs Block --------------------------
const mockBlock = {
  nodeName: "block",

  _attributes: {
    id: "mock-block-123",
    type: "VISUALIZATION_V2",

    input: {
      dataframeName: "df",
      chartType: "groupedColumn",

      xAxis: { name: "age", type: "int32" },
      xAxisName: "age",
      xAxisSort: "ascending",
      xAxisGroupFunction: null,

      yAxes: [
        {
          id: "y-axis-1",
          series: [
            {
              id: "series-1",
              column: { name: "id", type: "int32" },
              aggregateFunction: "sum",
            },
          ],
        },
      ],

      filters: [],
    },

    output: null,
    controlsHidden: false,
    error: null,
  },

  // --- Mock Yjs API Methods --------------------
  getAttribute(key) {
    return this._attributes[key];
  },

  setAttribute(key, value) {
    this._attributes[key] = value;
  },

  removeAttribute(key) {
    delete this._attributes[key];
  },

  getAttributes() {
    return new Map(Object.entries(this._attributes));
  },
};

// --- Mock Dataframes Collection (Y.Map-like) ----
const mockDataframes = {
  _store: new Map([
    [
      "df",
      {
        name: "df",
        columns: [
          { name: "id", type: "int32" },
          { name: "name", type: "object" },
          { name: "email", type: "object" },
          { name: "age", type: "int32" },
          { name: "country", type: "object" },
        ],
        rows: [
          {
            id: 1,
            name: "Si",
            email: "si@example.com",
            age: 25,
            country: "Nigeria",
          },
          {
            id: 2,
            name: "Zoe",
            email: "zoe@example.com",
            age: 29,
            country: "USA",
          },
          { id: 3, name: "Leo", email: "leo@worm.ai", age: 27, country: "UK" },
          {
            id: 4,
            name: "Tayo",
            email: "tayo@web3.dev",
            age: 31,
            country: "Ghana",
          },
          {
            id: 5,
            name: "Nina",
            email: "nina@codebae.com",
            age: 23,
            country: "Kenya",
          },
        ],
      },
    ],
  ]),

  // Y.Map API
  get(key) {
    return this._store.get(key);
  },

  set(key, value) {
    this._store.set(key, value);
  },

  has(key) {
    return this._store.has(key);
  },

  keys() {
    return this._store.keys();
  },
};

// --- Full Props to Pass ------------------------
export const visualizationMockProps = {
  isPublicMode: false,
  isEditable: false,
  document: { id: "mock-doc-id", title: "Mock Dashboard" },
  addGroupedBlock: () => {},
  block: mockBlock,
  blocks: {},
  dataframes: mockDataframes,
  dragPreview: "MOCK_DRAG",
  dashboardMode: null,
  hasMultipleTabs: false,
  isBlockHiddenInPublished: false,
  onToggleIsBlockHiddenInPublished: () => {},
  userId: "mock-user-123",
  executionQueue: "MOCK_QUEUE",
  isFullScreen: true,
  isCursorWithin: false,
  isCursorInserting: false,
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
        <VisualizationBlockV2 {...visualizationMockProps} />
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
