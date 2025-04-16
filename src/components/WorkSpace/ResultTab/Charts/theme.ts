import Highcharts from "highcharts";

const darkTheme: Highcharts.Options = {
  chart: {
    backgroundColor: "transparent",
    style: {
      fontFamily: "'DM Mono', monospace",
    },
  },
  title: {
    style: {
      color: "#ffffff",
      fontWeight: "bold",
    },
  },
  tooltip: {
    backgroundColor: "#1a1a1a",
    style: {
      color: "#ffffff",
    },
  },
  legend: {
    itemStyle: {
      color: "#ffffff",
    },
    itemHoverStyle: {
      color: "#a3e635",
    },
  },
  plotOptions: {
    pie: {
      dataLabels: {
        color: "#ffffff",
        style: {
          fontWeight: "normal",
        },
      },
    },
  },
};

export default darkTheme;
