import type Highcharts from "highcharts";

export const getPieChartOptions = (
  data: { name: string; y: number }[],
  xAxis: string,
  yAxis: string,
  title?: string
): Highcharts.Options => {
  return {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      style: {
        padding: "0.8rem",
      },
    },
    title: {
      text: title,
      style: {
        color: "#fff",
        fontSize: "16px",
        fontFamily: "'DM Mono', monospace",
      },
      align: "center",
    },
    tooltip: {
      pointFormat: "<b>{point.y}</b><br/>{point.percentage:.1f}%",
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
        name: yAxis ?? "Value",
        type: "pie",
        data,
      },
    ],
  };
};
