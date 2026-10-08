import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import api from "../api/axios";
import Layout from "../components/Layout";
import "./SuppliersPage.css";
import "./SupplierPerformancePage.css";

export default function SupplierPerformancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/suppliers/performance/")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (score) => {
    if (score === null) return "#8A909C";
    if (score >= 80) return "#6B8F7A";
    if (score >= 50) return "#C9A24B";
    return "#8B3A3A";
  };

  const chartData = data
    .filter((s) => s.score !== null)
    .map((s) => ({ name: s.supplier_name, score: s.score }))
    .sort((a, b) => b.score - a.score);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Layout
      title="Supplier Performance"
      subtitle="Suppliers ranked by delivery reliability and order completion."
    >
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <h3>Score Comparison</h3>

        {chartData.length === 0 ? (
          <div className="chart-empty">No scored suppliers yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

              <XAxis
                dataKey="name"
                tick={{ fontSize: 10.5, fill: "#5B6B78" }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #eef0f3",
                  fontSize: 13,
                }}
              />

              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={scoreColor(entry.score)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Supplier</th>
              <th>Category</th>
              <th>Orders</th>
              <th>Completion Rate</th>
              <th>Punctuality Rate</th>
              <th>Score</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="empty-row">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
                  No suppliers yet.
                </td>
              </tr>
            )}

            {data.map((s, index) => (
              <tr key={s.supplier_id}>
                <td className="cell-strong">
                  {medals[index] || `#${index + 1}`}
                </td>

                <td className="cell-strong">{s.supplier_name}</td>

                <td>{s.category}</td>

                <td>{s.total_orders}</td>

                {/* Completion Rate */}
                <td>
                  {s.completion_rate !== null ? (
                    <div className="rate-bar-wrap">
                      <div className="rate-bar-track">
                        <div
                          className="rate-bar-fill"
                          style={{
                            width: `${s.completion_rate}%`,
                            background: "#6B8F7A",
                          }}
                        />
                      </div>

                      <span className="rate-bar-label">
                        {s.completion_rate}%
                      </span>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

                {/* Punctuality Rate */}
                <td>
                  {s.punctuality_rate !== null ? (
                    <div className="rate-bar-wrap">
                      <div className="rate-bar-track">
                        <div
                          className="rate-bar-fill"
                          style={{
                            width: `${s.punctuality_rate}%`,
                            background: "#C9A24B",
                          }}
                        />
                      </div>

                      <span className="rate-bar-label">
                        {s.punctuality_rate}%
                      </span>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>

                {/* Score */}
                <td>
                  {s.score !== null ? (
                    <span
                      className="status-pill"
                      style={{
                        background: `${scoreColor(s.score)}22`,
                        color: scoreColor(s.score),
                      }}
                    >
                      {s.score}
                    </span>
                  ) : (
                    <span className="status-pill">No data</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}