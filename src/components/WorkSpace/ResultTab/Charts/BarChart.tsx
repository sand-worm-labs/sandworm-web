import { getBarChartOptions } from "@/lib/getBarChartOptions";
import { Chart } from ".";
import type { ChartProps } from "@/types";

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
