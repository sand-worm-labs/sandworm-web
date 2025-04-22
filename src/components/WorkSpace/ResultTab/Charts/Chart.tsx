import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMemo, useState, useEffect } from "react";

import { getDefaultAxis, sanitizeChartData } from "@/lib/charts";
import type { ChartProps } from "@/types";

import { ChartControl } from ".";

interface ChartComponentProps extends ChartProps {
  getChartOptions: (
    data: { name: string; y: number }[],
    xAxis: string,
    yAxis: string,
    title?: string
  ) => Highcharts.Options;
}

export const Chart: React.FC<ChartComponentProps> = ({
  chartType,
  result,
  title,
  getChartOptions,
}) => {
  const defaultAxis = useMemo(
    () => getDefaultAxis(result, chartType),
    [result, chartType]
  );

  const [xAxis, setXAxis] = useState<string | null>(defaultAxis?.x || null);
  const [yAxis, setYAxis] = useState<string | null>(defaultAxis?.y || null);

  useEffect(() => {
    if (defaultAxis) {
      setXAxis(defaultAxis.x);
      setYAxis(defaultAxis.y);
    }
  }, [defaultAxis]);

  const parsedData = useMemo(() => {
    if (!xAxis || !yAxis) return [];
    return sanitizeChartData(result, xAxis, yAxis).map(item => ({
      name: item.x,
      y: item.y,
    }));
  }, [result, xAxis, yAxis]);

  const chartOptions = useMemo(() => {
    if (!xAxis || !yAxis) return {};
    return getChartOptions(parsedData, xAxis, yAxis, title);
  }, [parsedData, xAxis, yAxis, title]);

  if (!xAxis || !yAxis) {
    return (
      <div className="p-4 border border-red-400 bg-red-50 rounded-lg text-red-700 font-mono">
        <p className="text-sm">
          Missing or invalid X or Y axis. Please select X and Y columns
          manually.
        </p>
        <ChartControl
          columns={result.columns}
          selectedXAxis={xAxis ?? ""}
          selectedYAxis={yAxis ?? ""}
          onChange={({ xAxis: newX, yAxis: newY }) => {
            setXAxis(newX);
            setYAxis(newY);
          }}
        />
      </div>
    );
  }

  return (
    <div className="overflow-scroll max-w-full max-h-[400px]">
      <ChartControl
        columns={result.columns}
        selectedXAxis={xAxis}
        selectedYAxis={yAxis}
        onChange={({ xAxis: newX, yAxis: newY }) => {
          setXAxis(newX);
          setYAxis(newY);
        }}
        data={result.data}
      />
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};
