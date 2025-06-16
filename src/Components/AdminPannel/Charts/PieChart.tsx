import { Chart } from "react-google-charts";
import "./Styles.css";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store/Store";

const PieChart = () => {
  const {dashboard}:any=useSelector((state:RootState)=>state.UserMangment)
  const data = [
    ["Task", "Hours per Day"],
    ["Active users", dashboard?.data?.ActiveUsers ],
    ["Emergency", dashboard?.data?.Emergency],
    ["Reports", dashboard?.data?.TotalReports],
    ["GST Users", dashboard?.data?.GstUsers],
    ["In active", dashboard?.data?.TotalSuspendedAccounts],
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
