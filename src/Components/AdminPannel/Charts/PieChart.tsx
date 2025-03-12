import { Chart } from "react-google-charts";
import "./Styles.css";

const PieChart = () => {
  const data = [
    ["Task", "Hours per Day"],
    ["Active users", 11],
    ["Emergency", 2],
    ["Reports", 2],
    ["Critical Emergency", 2],
    ["In active", 7],
  ];

  const options = {
    backgroundColor: "transparent",
    chartArea: { width: "90%", height: "90%" }, 
    legend: { textStyle: { color: "white", fontSize: 16 } }, 
    titleTextStyle: { color: "white", fontSize: 20 }, 
    pieSliceTextStyle: { color: "white", fontSize: 14 },
  };

  return (
    <div className="piechart-container">
      <Chart
        chartType="PieChart"
        width="500px" 
        height="250px" 
        data={data}
        options={options}
      />
    </div>
  );
};

export default PieChart;
