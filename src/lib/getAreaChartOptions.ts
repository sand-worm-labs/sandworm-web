import type Highcharts from "highcharts";

export const getAreaChartOptions = (
  data: { name: string; y: number; x?: number }[],
  xAxis: string,
  yAxis: string,
  title?: string
): Highcharts.Options => {
  return {
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
      type: "category",
      labels: {
        style: {
          color: "#fff",
        },
      },
      title: {
        text: xAxis,
        style: {
          color: "#fff",
        },
      },
    },
    yAxis: {
      title: {
        text: yAxis,
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
      pointFormat: `{point.y}`,
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
        name: yAxis,
        type: "area",
        data,
        color: "#38bdf8",
      },
    ],
  };
};
