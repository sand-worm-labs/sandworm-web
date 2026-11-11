import { Card } from "@sandworm/ui/kit/card";

import { CellView } from "@/components/Cells/CellView";
import type { CellsBlock } from "@/types";

export function CellsCard({ block }: { block: CellsBlock }) {
  return (
    <section
      aria-label={block.title}
      className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2"
    >
      {block.items.map(item => (
        <Card key={item.id} className="p-4">
          <CellView outputs={item.outputs} title={item.title} />
        </Card>
      ))}
    </section>
  );
}
