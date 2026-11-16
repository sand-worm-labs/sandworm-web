import { Card } from "@sandworm/ui/kit/card";

import { KpiFigure } from "@/components/Kpi/KpiFigure";
import type { Kpi } from "@/types";

export function KpiStrip({
  label,
  kpis,
}: {
  label: string;
  kpis: readonly Kpi[];
}) {
  return (
    <Card
      aria-label={label}
      className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] divide-border-secondary overflow-hidden md:divide-x"
    >
      {kpis.map(kpi => (
        <KpiFigure key={kpi.id} kpi={kpi} />
      ))}
    </Card>
  );
}
