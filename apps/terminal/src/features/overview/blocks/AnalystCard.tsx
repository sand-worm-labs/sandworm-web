import { AnalystPanel } from "../components/AnalystPanel";
import type { AnalystBlock } from "../types";

export function AnalystCard({ block }: { block: AnalystBlock }) {
  return (
    <AnalystPanel
      id={`${block.id}-title`}
      title={block.title}
      analyst={block.analyst}
      message={block.message}
      footnote={block.footnote}
    />
  );
}
