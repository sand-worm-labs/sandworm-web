import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMemo, useState, useEffect } from "react";
import { ChartControl } from "./ChartControl";
import { getDefaultAxis, sanitizeChartData } from "@/lib/charts";

export interface BarChartProps {
  result: {
    columns: string[];
    data: Record<string, any>[];
  };
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ result, title }) => {
  const defaultAxis = useMemo(() => getDefaultAxis(result, "bar"), [result]);

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

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
    },
    title: {
      text: title,
      style: {
        color: "#fff",
        fontFamily: "'DM Mono', monospace",
        fontSize: "16px",
      },
      align: "center",
    },
    xAxis: {
      categories: parsedData.map(item => item.name),
      labels: {
        style: {
          color: "#fff",
          fontFamily: "'DM Mono', monospace",
        },
      },
    },
    yAxis: {
      gridLineColor: "#ffffff30",
      gridLineWidth: 1,
      title: {
        text: yAxis ?? "Y Axis",
        style: {
          color: "#fff",
          fontFamily: "'DM Mono', monospace",
        },
      },
      labels: {
        style: {
          color: "#fff",
        },
      },
    },
    tooltip: {
      pointFormat: "<b>{point.y}</b>",
      backgroundColor: "#1a1a1a",
      style: {
        color: "#fff",
        fontFamily: "'DM Mono', monospace",
      },
    },
    series: [
      {
        name: yAxis ?? "Value",
        type: "column",
        data: parsedData,
        color: "#ffebb4",
      },
    ],
  };

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
