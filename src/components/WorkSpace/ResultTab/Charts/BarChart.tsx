import { getBarChartOptions } from "@/lib/getBarChartOptions";
import type { ChartProps } from "@/types";

import { Chart } from "./Chart";

export const BarChart: React.FC<ChartProps> = ({ result, title }) => {
  console.log("BarChart result:", result);
  return (
    <Chart
      chartType="bar"
      result={result}
      title={title}
      getChartOptions={getBarChartOptions}
    />
  );
};
