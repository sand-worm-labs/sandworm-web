"use client";

import React from "react";
import { Star, Expand, MoreVertical } from "lucide-react";
import VisualizationBlockV2 from "../Visualization";

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
      <p className=" text-[#455768] leading-relaxed">
        Building a database to know the rotation of the earth via a 2.5
        rotationary teloscope. This is a dummy text here designed to tst if this
        fits the design.
      </p>

      {/* Chart Placeholder */}
      <div className="w-full h-[500px]  flex items-center justify-center text-neutral-500 border border-[#EBD7D7] rounded-2xl">
        <VisualizationBlockV2
          isPublicMode={props.isPublicViewer}
          isEditable={props.isEditable}
          document={props.document}
          onAddGroupedBlock={props.addGroupedBlock}
          block={block}
          blocks={props.blocks}
          dataframes={props.dataframes}
          dragPreview={props.hasMultipleTabs ? null : props.dragPreview}
          dashboardMode={null}
          hasMultipleTabs={props.hasMultipleTabs}
          isBlockHiddenInPublished={props.tab.isHiddenInPublished}
          onToggleIsBlockHiddenInPublished={
            props.onToggleIsBlockHiddenInPublished
          }
          isCursorWithin={isCursorWithin}
          isCursorInserting={isCursorInserting}
          userId={props.userId}
          executionQueue={props.executionQueue}
          isFullScreen={props.isFullScreen}
        />
      </div>

      <div className=" text-[#455768] space-y-2 py-3">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
          odio. Praesent libero. Sed cursus ante dapibus diam.
        </p>
        <p>
          Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis
          ipsum. Praesent mauris.
        </p>
      </div>

      <div className="w-full h-[500px]  flex items-center justify-center text-neutral-500 border border-[#EBD7D7] rounded-2xl">
        <span>Chart Viz goes here 📊</span>
      </div>

      <div className=" text-[#455768] space-y-2 py-3">
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
