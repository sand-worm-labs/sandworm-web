import Highcharts from "highcharts";

interface ParsedChartData {
  name: string;
  y: number;
}

export const getBarChartOptions = (
  data: ParsedChartData[],
  xAxis: string,
  yAxis: string,
  title?: string
): Highcharts.Options => {
  return {
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
      categories: data.map(item => item.name),
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
        data,
        color: "#ffebb4",
      },
    ],
  };
};
