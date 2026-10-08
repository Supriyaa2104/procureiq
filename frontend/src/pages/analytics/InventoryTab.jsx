import { useEffect, useState } from "react";
import api from "../../api/axios";
import "../SuppliersPage.css";

export default function InventoryTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/analytics/inventory/")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setError(
          err.response?.status === 403
            ? "You don't have permission to view inventory analytics."
            : "Failed to load inventory analytics."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error || !data) {
    return <p>{error || "Failed to load inventory analytics."}</p>;
  }

  return (
    <>
      <div className="dash-kpis" style={{ marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-icon suppliers">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
          </div>
          <div className="kpi-label">Total Items</div>
          <div className="kpi-value">{data.total_items}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon pos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>
          </div>
          <div className="kpi-label">Low Stock Items</div>
          <div className="kpi-value">{data.low_stock_count}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon quotations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </div>
          <div className="kpi-label">Total Stock In</div>
          <div className="kpi-value">{data.total_stock_in.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon spend">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
          </div>
          <div className="kpi-label">Total Stock Out</div>
          <div className="kpi-value">{data.total_stock_out.toLocaleString()}</div>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: 20 }}>
        <table>
          <thead>
            <tr><th>Item</th><th>Current Stock</th><th>Status</th></tr>
          </thead>
          <tbody>
            {data.stock_levels.length === 0 && (
              <tr><td colSpan="3" className="empty-row">No inventory items yet.</td></tr>
            )}
            {data.stock_levels.map((item, i) => (
              <tr key={i}>
                <td className="cell-strong">{item.name}</td>
                <td>{item.current_stock} {item.unit}</td>
                <td>
                  <span className={`status-pill ${i.is_low_stock ? "low-stock" : "approved"}`}>
                    {item.is_low_stock ? "Low Stock" : "OK"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <div className="dash-table-header" style={{ padding: "14px 0 0" }}><h3>Recent Stock Movements</h3></div>
        <table>
          <thead>
            <tr><th>Item</th><th>Type</th><th>Quantity</th><th>Reason</th><th>Date</th></tr>
          </thead>
          <tbody>
            {data.recent_movements.length === 0 && (
              <tr><td colSpan="5" className="empty-row">No movements yet.</td></tr>
            )}
            {data.recent_movements.map((m, i) => (
              <tr key={i}>
                <td className="cell-strong">{m.item_name}</td>
                <td>
                  <span className={`status-pill ${m.movement_type === "IN" ? "approved" : "rejected"}`}>
                    {m.movement_type === "IN" ? "Stock In" : "Stock Out"}
                  </span>
                </td>
                <td>{m.quantity}</td>
                <td>{m.reason}</td>
                <td>{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}