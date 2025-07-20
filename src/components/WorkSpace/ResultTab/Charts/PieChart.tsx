import { getPieChartOptions } from "@/lib/gatPieChartOptions";
import type { ChartProps } from "@/types";

import { Chart } from "./Chart";

interface PieChartProps extends ChartProps {
  showControls?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  result,
  title,
  showControls = true,
}) => {
  return (
    <Chart
      chartType="pie"
      result={result}
      title={title}
      getChartOptions={getPieChartOptions}
      showControls={showControls}
    />
  );
};
