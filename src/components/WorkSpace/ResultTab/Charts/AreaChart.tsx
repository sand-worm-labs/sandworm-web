import { getAreaChartOptions } from "@/lib/getAreaChartOptions";
import { Chart } from ".";
import type { ChartProps } from "@/types";

export const AreaChart: React.FC<ChartProps> = ({ result, title }) => {
  return (
    <Chart
      chartType="area"
      result={result}
      title={title}
      getChartOptions={getAreaChartOptions}
    />
  );
};
