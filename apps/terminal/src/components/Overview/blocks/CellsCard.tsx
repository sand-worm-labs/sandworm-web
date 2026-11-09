import { Card } from "@sandworm/ui/kit/card";

import { CellView } from "@/components/Cells/CellView";
import { BlockHeader } from "@/components/Overview/BlockHeader";
import type { CellsBlock } from "@/types";

export function CellsCard({ block }: { block: CellsBlock }) {
  const titleId = `${block.id}-title`;

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-3.5">
      <BlockHeader id={titleId} title={block.title} subtitle={block.subtitle} />
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        {block.items.map(item => (
          <Card key={item.id} className="p-4">
            <CellView outputs={item.outputs} title={item.title} />
          </Card>
        ))}
      </div>
    </section>
  );
}
