import { getBarChartOptions } from "@/lib/getBarChartOptions";
import type { ChartProps } from "@/types";

import { Chart } from "./Chart";

interface BarChartProps extends ChartProps {
  showControls?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  result,
  title,
  showControls = true,
}) => {
  console.log("BarChart result:", result);
  return (
    <Chart
      chartType="bar"
      result={result}
      title={title}
      getChartOptions={getBarChartOptions}
      showControls={showControls}
    />
  );
};
