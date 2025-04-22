import { getPieChartOptions } from "@/lib/gatPieChartOptions";
import type { ChartProps } from "@/types";

import { Chart } from "./Chart";

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
