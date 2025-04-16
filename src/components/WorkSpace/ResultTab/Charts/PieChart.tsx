import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMemo } from "react";

export interface PieChartProps {
  result: {
    data: { chain: string; balance: string }[];
  };
}

export const PieChart: React.FC<PieChartProps> = ({ result }) => {
  const parsedData = useMemo(() => {
    if (!result?.data?.length) return [];

    return result.data.map(item => ({
      name: item.chain,
      y: parseFloat((Number(item.balance) / 1e18).toFixed(2)), // Convert from wei if needed
    }));
  }, [result]);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
    },
    title: {
      text: "Account Balance by Chain",
      style: {
        color: "#fff",
        fontWeight: "Medium",
        fontSize: "16px",
        fontFamily: "'DM Mono', monospace",
      },
      align: "left",
    },
    tooltip: {
      pointFormat: "<b>{point.y} ETH</b><br/>{point.percentage:.1f}%",
      backgroundColor: "#1a1a1a",
      style: {
        color: "#fff",
        fontFamily: "'DM Mono', monospace",
      },
    },
    accessibility: { enabled: false },
    plotOptions: {
      pie: {
        innerSize: "60%",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.percentage:.1f}%",
          distance: -40,
          style: {
            color: "white",
            fontSize: "12px",
            fontWeight: "bold",
            fontFamily: "'DM Mono', monospace",
          },
        },
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
      itemStyle: {
        color: "#fff",
        fontFamily: "'DM Mono', monospace",
      },
      itemHoverStyle: {
        color: "#a3e635",
      },
    },
    series: [
      {
        name: "Balance",
        type: "pie",
        data: parsedData,
      },
    ],
  };

  return (
    <div className="overflow-scroll max-w-full max-h-[400px]">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};
