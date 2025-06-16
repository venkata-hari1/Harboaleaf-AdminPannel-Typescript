import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,

} from "recharts";
import './Styles.css'
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../Redux/store/Store";
import { Admin_Dashboard } from "../../../Redux/Reducers/UserMangement";
import Skeleton from "react-loading-skeleton";


export default function App() {
  const {dashboard,loading}:any=useSelector((state:RootState)=>state.UserMangment)
  const chartData = dashboard?.data?.MonthlyRegistrations || [];
  const [year, setYear] = useState(new Date().getFullYear());
  const dispatch=useDispatch<AppDispatch>()
  const startYear = 2024;
const currentYear = new Date().getFullYear();
  useEffect(() => {
    const data = { year };
    async function getData(){
      if(year){
     await dispatch(Admin_Dashboard({ data }));
      }
    }getData()
   
  }, [year, dispatch]);

  const yearOptions = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );
  return (
    <div className="bar-chart-conatiner">
    <div className="d-flex justify-content-between">
    <h4 className="users-title">Users</h4>
    {/* <select
          className="form-select w-auto bg-dark text-white"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {yearOptions.reverse().map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select> */}
    </div>  
   
    <div style={{ background: "transparent", padding: 20 }}>
    {loading ? (
        <div style={{ color: 'white', textAlign: 'center' }}>
          <Skeleton height={250}  width={400} baseColor="#202020" highlightColor="#444"/>
        </div>
      ) : (
      
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={chartData} barSize={40}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="18.75%" stopColor="#2271C6" />
                  <stop offset="100%" stopColor="#000B47" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
              <XAxis dataKey="month" tick={{ fill: "white", fontSize: 12 }} />
              <YAxis tick={{ fill: "white", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0A0F2D", border: "none", color: "white" }}
                cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>)}
    
    </div>
    </div>
  );
}
