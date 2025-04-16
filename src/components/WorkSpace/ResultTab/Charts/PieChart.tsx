import { getPieChartOptions } from "@/lib/gatPieChartOptions";
import { Chart } from ".";
import type { ChartProps } from "@/types";

export const PieChart: React.FC<ChartProps> = ({ result, title }) => {
  return (
    <Chart
      chartType="pie"
      result={result}
      title={title}
      getChartOptions={getPieChartOptions}
    />
  );
};
