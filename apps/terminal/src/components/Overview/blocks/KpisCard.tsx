import { Card } from "@sandworm/ui/kit/card";

import { KpiFigure } from "@/components/Kpi/KpiFigure";
import type { KpisBlock } from "@/types";

export function KpisCard({ block }: { block: KpisBlock }) {
  return (
    <Card
      bleed
      aria-label={block.title}
      className="grid h-full grid-cols-2 divide-border-secondary overflow-hidden max-md:[&>*:nth-child(n+3)]:border-t max-md:[&>*:nth-child(odd)]:border-r max-md:[&>*]:border-border-secondary md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] md:divide-x"
    >
      {block.items.map(kpi => (
        <KpiFigure key={kpi.id} kpi={kpi} />
      ))}
    </Card>
  );
}
