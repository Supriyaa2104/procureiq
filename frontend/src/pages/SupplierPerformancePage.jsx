import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import "./SuppliersPage.css";

export default function SupplierPerformancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/suppliers/performance/")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (score) => {
    if (score === null) return "";
    if (score >= 80) return "approved";
    if (score >= 50) return "pending";
    return "rejected";
  };

  return (
    <Layout title="Supplier Performance" subtitle="Suppliers ranked by delivery reliability and order completion.">
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Supplier</th>
              <th>Category</th>
              <th>Total Orders</th>
              <th>Completion Rate</th>
              <th>Punctuality Rate</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="7" className="empty-row">Loading...</td></tr>}
            {!loading && data.length === 0 && (
              <tr><td colSpan="7" className="empty-row">No suppliers yet.</td></tr>
            )}
            {data.map((s, index) => (
              <tr key={s.supplier_id}>
                <td className="cell-strong">#{index + 1}</td>
                <td className="cell-strong">{s.supplier_name}</td>
                <td>{s.category}</td>
                <td>{s.total_orders}</td>
                <td>{s.completion_rate !== null ? `${s.completion_rate}%` : "—"}</td>
                <td>{s.punctuality_rate !== null ? `${s.punctuality_rate}%` : "—"}</td>
                <td>
                  {s.score !== null ? (
                    <span className={`status-pill ${scoreColor(s.score)}`}>{s.score}</span>
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