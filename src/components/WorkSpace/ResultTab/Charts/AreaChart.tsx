import { getAreaChartOptions } from "@/lib/getAreaChartOptions";
import type { ChartProps } from "@/types";
import { Chart } from "@/components";

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
