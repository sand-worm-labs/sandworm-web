import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export interface AreaChartProps {
  result: {
    data: { chain: string; balance: string }[];
  };
  title: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({ result, title }) => {
  const chartData = result.data.map((item, index) => ({
    x: new Date(Date.now() + index * 3600_000).getTime(),
    y: parseFloat((Number(item.balance) / 1e18).toFixed(6)),
    name: item.chain,
  }));

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "area",
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
      type: "datetime",
      labels: {
        style: {
          color: "#fff",
        },
      },
      title: {
        text: "Time",
        style: {
          color: "#fff",
        },
      },
    },
    yAxis: {
      title: {
        text: "Value (ETH)",
        style: {
          color: "#fff",
        },
      },
      labels: {
        style: {
          color: "#fff",
        },
      },
      gridLineColor: "#ffffff30",
    },
    tooltip: {
      headerFormat: "<b>{point.name}</b><br/>",
      pointFormat: "{point.y} ETH",
      backgroundColor: "#1a1a1a",
      style: {
        color: "#fff",
        fontFamily: "'DM Mono', monospace",
      },
    },
    plotOptions: {
      area: {
        fillOpacity: 0.3,
        marker: {
          enabled: false,
        },
      },
    },
    series: [
      {
        name: "TVL",
        type: "area",
        data: chartData,
        color: "#38bdf8",
      },
    ],
  };

  return (
    <div className="overflow-scroll max-w-full max-h-[400px]">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};
