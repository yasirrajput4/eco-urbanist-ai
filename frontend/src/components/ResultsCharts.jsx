/**
 * ResultsCharts.jsx
 * Place at: frontend/src/components/ResultsCharts.jsx
 *
 * Lazy-loaded recharts wrapper for Results page.
 * Imported via React.lazy() in Results.jsx so the heavy recharts
 * bundle only downloads when Results page is actually visited.
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
import { BarChart3, Sparkles } from "lucide-react";

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "2px solid #22c55e",
  borderRadius: "12px",
  fontWeight: "bold",
};

const ResultsCharts = ({ chartData, radarData }) => {
  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-10">
      {/* Bar Chart — original design preserved */}
      <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
          Coverage Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              style={{ fontWeight: "bold" }}
            />
            <YAxis stroke="#6b7280" style={{ fontWeight: "bold" }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`${value}%`, "Green Coverage"]}
            />
            <Legend wrapperStyle={{ fontWeight: "bold" }} />
            <Bar
              dataKey="Green Coverage"
              fill="url(#greenGradient)"
              radius={[12, 12, 0, 0]}
            />
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 text-center bg-green-50 py-4 rounded-xl">
          <p className="text-sm text-gray-600">
            Total Improvement:{" "}
            <span className="font-black text-green-600 text-2xl">
              +
              {(
                chartData[1]["Green Coverage"] - chartData[0]["Green Coverage"]
              ).toFixed(2)}
              %
            </span>
          </p>
        </div>
      </div>

      {/* Radar Chart — original design preserved */}
      <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
          <Sparkles className="w-6 h-6 mr-3 text-green-600" />
          Multi-Factor Impact Analysis
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
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600 font-semibold">
            Comprehensive environmental benefit assessment
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsCharts;
