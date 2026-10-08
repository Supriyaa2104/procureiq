import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/axios";
import "../SuppliersPage.css";

export default function SalesTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/analytics/sales/")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setError(
          err.response?.status === 403
            ? "You don't have permission to view sales analytics."
            : "Failed to load sales analytics."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !data) {
    return <p>{error || "Failed to load sales analytics."}</p>;
  }

  return (
    <>
      <div className="dash-kpis" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-icon spend">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">Rs. {data.total_revenue.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon quotations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
          </div>
          <div className="kpi-label">Total Bills</div>
          <div className="kpi-value">{data.total_bills}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon pos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </div>
          <div className="kpi-label">Outstanding (Unpaid)</div>
          <div className="kpi-value">Rs. {data.unpaid_amount.toLocaleString()}</div>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: 20 }}>
        <h3>Monthly Revenue</h3>
        {data.revenue_by_month.length === 0 ? (
          <div className="chart-empty">No sales data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.revenue_by_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5B6B78" }} />
              <YAxis tick={{ fontSize: 12, fill: "#5B6B78" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #eef0f3", fontSize: 13 }} />
              <Line type="monotone" dataKey="revenue" stroke="#C1440E" strokeWidth={2.5} dot={{ r: 4, fill: "#C1440E" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr><th>Item</th><th>Quantity Sold</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            {data.best_sellers.length === 0 && (
              <tr><td colSpan="3" className="empty-row">No sales data yet.</td></tr>
            )}
            {data.best_sellers.map((item, i) => (
              <tr key={i}>
                <td className="cell-strong">{item.item_name}</td>
                <td>{item.total_quantity}</td>
                <td>Rs. {item.total_revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}