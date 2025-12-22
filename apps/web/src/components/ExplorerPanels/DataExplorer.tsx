"use client";

import { Rnd } from "react-rnd";
import { DataExplorerContent } from "./DataExplorerContent";

const getInitialPosition = () => {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 };
  }

  const panelWidth = 620;
  const panelHeight = 650;
  const margin = 20;

  return {
    x: window.innerWidth - panelWidth - margin,
    y: window.innerHeight - panelHeight - margin,
  };
};

export function DataExplorer({ onClose }: { onClose?: () => void }) {
  const initialPos = getInitialPosition();

  return (
    <Rnd
      default={{
        ...initialPos,
        width: 400,
        height: 600,
      }}
      minWidth={300}
      minHeight={200}
      bounds="window"
      dragHandleClassName="drag-handle"
      cancel=".no-drag"
      className="z-[100]"
    >
      <DataExplorerContent onClose={onClose} showDragHandle />
    </Rnd>
  );
}
