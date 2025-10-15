"use client";

import React from "react";
import { Star, Expand, MoreVertical } from "lucide-react";
import * as Y from "yjs";
import { BlockType } from "@sandworm/editor";
import type {
  ExecutionQueue,
  YBlock,
  VisualizationV2Block,
  ExecutionQueueBatch,
  RunAllSource,
  YBlockGroup,
} from "@sandworm/editor";
import type { DataFrame } from "@sandworm/types";

import VisualizationBlockV2 from "../Visualization";

const yDoc = new Y.Doc();

// Create a visualization block
const visualizationBlock = new Y.XmlElement(
  "visualization"
) as Y.XmlElement<VisualizationV2Block>;
visualizationBlock.setAttribute("type", BlockType.VisualizationV2);
visualizationBlock.setAttribute("id", "visualization");

// Set up blocks map
const blocks = yDoc.getMap<YBlock>("blocks");
blocks.set("visualization", visualizationBlock as YBlock);

// Set up other Y.js structures
const dataframes = yDoc.getMap<DataFrame>("dataframes");

const executionQueue: ExecutionQueue = {
  blocks: new Y.Map<YBlock>(),
  queue: new Y.Array(),
  layout: new Y.Array(),
  observers: new Set(),
  options: {},
  enqueueBlock: () => {},
  enqueueBlockGroup: () => {},
  enqueueBlockOnwards: () => {},
  enqueueRunAll: (
    layout: Y.Array<YBlockGroup>,
    blocksMap: Y.Map<YBlock>,
    source: RunAllSource
  ): ExecutionQueueBatch => ({
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
          <MoreVertical className="w-4 h-4 cursor-pointer hover:text-neutral-200 transition-colors" />
        </div>
      </div>

      {/* Description */}
      <p className="text-[#455768] leading-relaxed">
        Building a database to know the rotation of the earth via a 2.5
        rotationary telescope. This is a dummy text here designed to test if
        this fits the design.
      </p>

      {/* Chart Placeholder */}
      <div className="w-full h-[500px] flex items-center justify-center text-neutral-500 border border-[#EBD7D7] rounded-2xl">
        <VisualizationBlockV2
          isPublicMode={false}
          isEditable={true}
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

      <div className="text-[#455768] space-y-2 py-3">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
          odio. Praesent libero. Sed cursus ante dapibus diam.
        </p>
        <p>
          Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis
          ipsum. Praesent mauris.
        </p>
      </div>

      <div className="w-full h-[500px] flex items-center justify-center text-neutral-500 border border-[#EBD7D7] rounded-2xl">
        <span>Chart Viz goes here 📊</span>
      </div>

      <div className="text-[#455768] space-y-2 py-3">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
          odio. Praesent libero. Sed cursus ante dapibus diam.
        </p>
        <p>
          Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis
          ipsum. Praesent mauris.
        </p>
      </div>
    </div>
  );
};
