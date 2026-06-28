/**
 * RechartsBundle.jsx
 * Place at: frontend/src/components/RechartsBundle.jsx
 *
 * Lazy-loaded recharts wrapper — imported via React.lazy() in Results.jsx.
 * Splitting it here means recharts JS only downloads when the Results
 * page is first visited, not on initial app load.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "2px solid #22c55e",
  borderRadius: "12px",
  fontWeight: "bold",
};

const RechartsBundle = ({ chartData, radarData }) => {
  return (
    <>
      {/* Bar Chart */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
        <h3 className="text-2xl font-black text-gray-900 mb-6">
          📊 Green Coverage Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" style={{ fontWeight: "bold" }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              style={{ fontWeight: "bold" }}
            />
            <Tooltip
              formatter={(v) => [`${v.toFixed(2)}%`, "Green Coverage"]}
              contentStyle={tooltipStyle}
            />
            <Legend />
            <Bar
              dataKey="Green Coverage"
              fill="#22c55e"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
        <h3 className="text-2xl font-black text-gray-900 mb-6">
          ✨ Multi-Factor Impact Analysis
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="metric"
              style={{ fontSize: "12px", fontWeight: "bold" }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Before"
              dataKey="before"
              stroke="#94a3b8"
              fill="#94a3b8"
              fillOpacity={0.3}
            />
            <Radar
              name="After"
              dataKey="after"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.5}
            />
            <Legend />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default RechartsBundle;
