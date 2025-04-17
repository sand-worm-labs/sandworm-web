import { getBarChartOptions } from "@/lib/getBarChartOptions";
import type { ChartProps } from "@/types";

import { Chart } from ".";

export const BarChart: React.FC<ChartProps> = ({ result, title }) => {
  return (
    <Chart
      chartType="bar"
      result={result}
      title={title}
      getChartOptions={getBarChartOptions}
    />
  );
};
