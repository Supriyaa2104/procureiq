import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import "./SuppliersPage.css";

export default function SupplierPaymentsPage() {
  const { user } = useAuth();
  const canRecordPayment = user?.role === "ADMIN" || user?.role === "PROCUREMENT_STAFF";

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ purchase_order: "", amount: "", method: "CASH" });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/purchase-orders/"),
      api.get("/supplier-payments/"),
    ])
      .then(([poRes, paymentsRes]) => {
        setPurchaseOrders(poRes.data.results ?? poRes.data);
        setPayments(paymentsRes.data.results ?? paymentsRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const unpaidOrders = purchaseOrders.filter((po) => parseFloat(po.balance_due) > 0 && po.status !== "CANCELLED");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/supplier-payments/", form);
      setForm({ purchase_order: "", amount: "", method: "CASH" });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  const poLabel = (poId) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    return po ? `PO-${String(po.id).padStart(4, "0")} — ${po.supplier_name}` : `PO-${String(poId).padStart(4, "0")}`;
  };

  return (
    <Layout title="Supplier Payments" subtitle="Track what you owe suppliers and record payments made.">
      {canRecordPayment && (
        <div className="page-header" style={{ justifyContent: "flex-end" }}>
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Record Payment"}
          </button>
        </div>
      )}

      {showForm && canRecordPayment && (
        <form className="supplier-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Purchase Order *</label>
              <select name="purchase_order" value={form.purchase_order} onChange={handleChange} required>
                <option value="">Select an order with balance due</option>
                {unpaidOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    PO-{String(po.id).padStart(4, "0")} — {po.supplier_name} — Rs. {po.balance_due} due
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Amount *</label>
              <input type="number" step="0.01" name="amount" value={form.amount} onChange={handleChange} required min="0.01" />
            </div>
            <div className="form-field">
              <label>Method *</label>
              <select name="method" value={form.method} onChange={handleChange} required>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="ESEWA">eSewa</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Record Payment"}
          </button>
        </form>
      )}

      <div className="table-card" style={{ marginBottom: 20 }}>
        <table>
          <thead>
            <tr>
              <th>PO No.</th>
              <th>Supplier</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Balance Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6" className="empty-row">Loading...</td></tr>}
            {!loading && purchaseOrders.length === 0 && (
              <tr><td colSpan="6" className="empty-row">No purchase orders yet.</td></tr>
            )}
            {purchaseOrders.map((po) => (
              <tr key={po.id}>
                <td className="cell-strong">PO-{String(po.id).padStart(4, "0")}</td>
                <td>{po.supplier_name}</td>
                <td>Rs. {parseFloat(po.total_amount).toLocaleString()}</td>
                <td>Rs. {parseFloat(po.amount_paid).toLocaleString()}</td>
                <td>
                  {parseFloat(po.balance_due) > 0 ? (
                    <span style={{ color: "var(--rust)", fontWeight: 600 }}>
                      Rs. {parseFloat(po.balance_due).toLocaleString()}
                    </span>
                  ) : (
                    <span style={{ color: "var(--herb)", fontWeight: 600 }}>Paid in full</span>
                  )}
                </td>
                <td><span className={`status-pill ${po.status.toLowerCase()}`}>{po.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-card">
        <div className="dash-table-header" style={{ padding: "14px 0 0" }}><h3>Payment History</h3></div>
        <table>
          <thead>
            <tr>
              <th>Purchase Order</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Paid By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="empty-row">Loading...</td></tr>}
            {!loading && payments.length === 0 && (
              <tr><td colSpan="5" className="empty-row">No payments recorded yet.</td></tr>
            )}
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="cell-strong">{poLabel(p.purchase_order)}</td>
                <td>Rs. {parseFloat(p.amount).toLocaleString()}</td>
                <td>{p.method}</td>
                <td>{p.paid_by_username || "—"}</td>
                <td>{new Date(p.paid_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}