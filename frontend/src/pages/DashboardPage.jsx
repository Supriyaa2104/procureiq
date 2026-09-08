import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import "./DashboardPage.css";

const COLORS = ["#2563eb", "#0d9488", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/suppliers/"),
      api.get("/quotations/"),
      api.get("/purchase-orders/"),
    ])
      .then(([supRes, quoRes, poRes]) => {
        setSuppliers(supRes.data.results ?? supRes.data);
        setQuotations(quoRes.data.results ?? quoRes.data);
        setPurchaseOrders(poRes.data.results ?? poRes.data);
      })
      .catch((err) => console.error("Dashboard load error:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalSpend = purchaseOrders.reduce((sum, po) => sum + parseFloat(po.total_amount || 0), 0);

  const spendBySupplier = Object.values(
    purchaseOrders.reduce((acc, po) => {
      const key = po.supplier_name || "Unknown";
      if (!acc[key]) acc[key] = { name: key, spend: 0 };
      acc[key].spend += parseFloat(po.total_amount || 0);
      return acc;
    }, {})
  );

  const categoryBreakdown = Object.values(
    suppliers.reduce((acc, s) => {
      const key = s.category || "Other";
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += 1;
      return acc;
    }, {})
  );

  const statusCounts = purchaseOrders.reduce((acc, po) => {
    acc[po.status] = (acc[po.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Your procurement activity at a glance.">
        <p>Loading dashboard...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle="Your procurement activity at a glance.">
      <div className="dash-kpis">
        <div className="kpi-card">
          <div className="kpi-icon suppliers">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><path d="M17 3.5a4 4 0 0 1 0 7" /></svg>
          </div>
          <div className="kpi-label">Total Suppliers</div>
          <div className="kpi-value">{suppliers.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon quotations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
          </div>
          <div className="kpi-label">Total Quotations</div>
          <div className="kpi-value">{quotations.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon pos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          </div>
          <div className="kpi-label">Total Purchase Orders</div>
          <div className="kpi-value">{purchaseOrders.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon spend">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <div className="kpi-label">Total Spend</div>
          <div className="kpi-value">Rs. {totalSpend.toLocaleString()}</div>
        </div>
      </div>

      <div className="dash-charts">
        <div className="chart-card">
          <h3>Spend by Supplier</h3>
          {spendBySupplier.length === 0 ? (
            <div className="chart-empty">No purchase order data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={spendBySupplier} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10.5, fill: "#5B6B78" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #eef0f3", fontSize: 13 }} />
                <Bar dataKey="spend" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>Suppliers by Category</h3>
          {categoryBreakdown.length === 0 ? (
            <div className="chart-empty">No supplier data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #eef0f3", fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12.5 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dash-tables">
        <div className="dash-table-card">
          <div className="dash-table-header"><h3>Recent Purchase Orders</h3></div>
          <table>
            <thead>
              <tr><th>PO No.</th><th>Supplier</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {purchaseOrders.slice(0, 5).map((po) => (
                <tr key={po.id}>
                  <td>PO-{String(po.id).padStart(4, "0")}</td>
                  <td>{po.supplier_name}</td>
                  <td>Rs. {parseFloat(po.total_amount).toLocaleString()}</td>
                  <td><span className={`status-pill ${po.status.toLowerCase()}`}>{po.status}</span></td>
                </tr>
              ))}
              {purchaseOrders.length === 0 && (
                <tr><td colSpan="4" className="empty-row">No purchase orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-table-card">
          <div className="dash-table-header"><h3>Recent Quotations</h3></div>
          <table>
            <thead>
              <tr><th>QTN No.</th><th>Supplier</th><th>Item</th><th>Status</th></tr>
            </thead>
            <tbody>
              {quotations.slice(0, 5).map((q) => (
                <tr key={q.id}>
                  <td>QTN-{String(q.id).padStart(4, "0")}</td>
                  <td>{q.supplier_name}</td>
                  <td>{q.item_name}</td>
                  <td><span className={`status-pill ${q.status.toLowerCase()}`}>{q.status}</span></td>
                </tr>
              ))}
              {quotations.length === 0 && (
                <tr><td colSpan="4" className="empty-row">No quotations yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}