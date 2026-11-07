import { Card } from "@sandworm/ui/kit/card";

import { KpiFigure } from "@/components/Kpi/KpiFigure";
import type { KpisBlock } from "@/types";

export function KpisCard({ block }: { block: KpisBlock }) {
  return (
    <Card
      aria-label={block.title}
      className="grid h-full grid-cols-[repeat(auto-fit,minmax(200px,1fr))] divide-border-secondary overflow-hidden md:divide-x"
    >
      {block.items.map(kpi => (
        <KpiFigure key={kpi.id} kpi={kpi} />
      ))}
    </Card>
  );
}
