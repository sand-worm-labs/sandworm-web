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

      <p className="text-[#050818] text-base leading-relaxed ">
        This dashboard visualizes the most actively traded tokens on Base over
        the past 30 days. The data highlights on-chain volume trends, unique
        holder growth, and the top projects driving activity within the Base
        ecosystem. It’s a test section meant to evaluate layout spacing and
        typography responsiveness across chart elements.
      </p>

      <div className="w-full flex items-center justify-center text-neutral-500  rounded-2xl relative pt-5">
        <VisualizationBlockV2
          isPublicMode={false}
          isEditable
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

      <div className="text-[#050818] text-base space-y-2 py-3">
        <p>
          The leading tokens by transaction count include several
          community-driven assets and DeFi primitives. While some of these
          tokens show consistent daily volume, others reflect cyclical hype
          driven by liquidity farming and protocol updates
        </p>
        <p>
          These insights help track capital flow, identify emerging projects,
          and provide a clearer understanding of Base’s on-chain momentum as the
          network matures. This block is purely for layout testing and does not
          represent live data.
        </p>
      </div>

      <div className="w-full flex items-center justify-center text-neutral-500  rounded-2xl relative pt-4">
        <VisualizationBlockV2
          isPublicMode={false}
          isEditable
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

      <div className="text-[#050818] text-base  space-y-2 py-3">
        <p>
          Future iterations of this visualization will include dynamic filtering
          by token type, project category, and activity source, giving users
          more granular control over their data views.
        </p>
        <p>
          Until then, this placeholder section serves as a design reference to
          test scroll behavior, spacing, and content density for data-heavy
          notebook.
        </p>
      </div>
    </div>
  );
};
