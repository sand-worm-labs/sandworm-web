import React from "react";

export const IndexCell = ({ index }: { index: number }) => (
  <span className="font-mono tabular-nums">{index + 1}</span>
);
