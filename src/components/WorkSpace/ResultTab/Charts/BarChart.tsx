import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMemo } from "react";

export interface BarChartProps {
  result: {
    data: { chain: string; balance: string }[];
  };
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ result, title }) => {
  console.log("bar", result);
  const parsedData = useMemo(() => {
    if (!result?.data?.length) return [];

    return result.data.map(item => ({
      name: item.chain,
      y: parseFloat((Number(item.balance) / 1e18).toFixed(6)),
    }));
  }, [result]);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      style: {
        padding: "0.8rem",
      },
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
        text: "Balance (ETH)",
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
      pointFormat: "<b>{point.y} ETH</b>",
      backgroundColor: "#1a1a1a",
      style: {
        color: "#fff",
        fontFamily: "'DM Mono', monospace",
      },
    },
    series: [
      {
        name: "Balance",
        type: "column",
        data: parsedData,
        color: "#ffebb4",
      },
    ],
  };

  return (
    <div className="overflow-scroll max-w-full max-h-[400px]">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};
