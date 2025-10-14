"use client";

import React from "react";
import { Star, Expand, MoreVertical } from "lucide-react";
import * as Y from "yjs";
import type {
  ExecutionQueue,
  YBlock,
  VisualizationV2Block,
} from "@sandworm/editor";
import type { DataFrame } from "@sandworm/types";

import VisualizationBlockV2 from "../Visualization";

// ✅ Create placeholder data (typed & clean)
const placeholderDoc = new Y.Doc();
const placeholderBlock =
  new Y.XmlElement() as Y.XmlElement<VisualizationV2Block>;
const placeholderBlocks = new Y.Map<YBlock>();
const placeholderDataframes = new Y.Map<DataFrame>();

// ✅ Create placeholder execution queue
const placeholderQueue: ExecutionQueue = {
  queue: new Y.Array(),
  blocks: new Y.Map<YBlock>(),
  layout: new Y.Array(),
  observers: new Set(),
  enqueueBlock: () => {},
  getCurrentBatch: () => null,
  advance: () => {},
  getBlockExecutions: () => [],
  observe: () => () => {},
  toJSON: () => [],
  getRunAllBatches: () => [],
  length: 0,
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
          isEditable={false}
          document={placeholderDoc}
          onAddGroupedBlock={() => {}}
          block={placeholderBlock}
          blocks={placeholderBlocks}
          dataframes={placeholderDataframes}
          dragPreview={null}
          dashboardMode={null}
          hasMultipleTabs={false}
          isBlockHiddenInPublished={false}
          onToggleIsBlockHiddenInPublished={() => {}}
          isCursorWithin={false}
          isCursorInserting={false}
          userId="default-user"
          executionQueue={placeholderQueue}
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
