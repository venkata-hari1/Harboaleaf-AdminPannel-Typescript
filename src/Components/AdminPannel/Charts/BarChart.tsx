import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,

} from "recharts";
import './Styles.css'
const data = [
  { month: "Jan", value: 45 },
  { month: "Feb", value: 78 },
  { month: "Mar", value: 32 },
  { month: "Apr", value: 85 },
  { month: "May", value: 60 },
  { month: "Jun", value: 90 },
  { month: "Jul", value: 40 },
  { month: "Aug", value: 70 },
  { month: "Sep", value: 55 },
  { month: "Oct", value: 88 },
  { month: "Nov", value: 65 },
  { month: "Dec", value: 92 }
];

export default function App() {
  return (
    <div className="bar-chart-conatiner">
    <h4 className="users-title">Users</h4>
    <div style={{ background: "transparent", padding: 20 }}>
      <ResponsiveContainer width="100%" height={290}>
        <BarChart data={data} barSize={40}>
          {/* Define the linear gradient */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="18.75%" stopColor="#2271C6" />
              <stop offset="100%" stopColor="#000B47" />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill: "white" }} />
          <YAxis domain={[0, 100]} tick={{ fill: "white" }} />
          <Tooltip />
          {/* Apply the gradient */}
          <Bar dataKey="value" fill="url(#barGradient)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
}
