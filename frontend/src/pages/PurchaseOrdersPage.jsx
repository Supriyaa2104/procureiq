import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ConfirmDialog";
import "./SuppliersPage.css";

const STATUSES = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED", "DELAYED"];

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    supplier: "",
    quotation: "",
    item_name: "",
    quantity: "",
    unit_price: "",
    status: "PENDING",
    expected_delivery_date: "",
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/purchase-orders/"),
      api.get("/suppliers/"),
      api.get("/quotations/"),
    ])
      .then(([poRes, sRes, qRes]) => {
        setPurchaseOrders(poRes.data.results ?? poRes.data);
        setSuppliers(sRes.data.results ?? sRes.data);
        setQuotations(qRes.data.results ?? qRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        quotation: form.quotation || null,
        expected_delivery_date: form.expected_delivery_date || null,
      };
      await api.post("/purchase-orders/", payload);
      setForm({
        supplier: "",
        quotation: "",
        item_name: "",
        quantity: "",
        unit_price: "",
        status: "PENDING",
        expected_delivery_date: "",
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Failed to create purchase order.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (po) => {
    setDeleteTarget(po);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/purchase-orders/${deleteTarget.id}/`);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert("Failed to delete purchase order.");
    }
  };

  return (
    <Layout
      title="Purchase Orders"
      subtitle="Create and track purchase orders sent to suppliers."
    >
      <div className="page-header" style={{ justifyContent: "flex-end" }}>
        <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create Purchase Order"}
        </button>
      </div>

      {showForm && (
        <form className="supplier-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Supplier *</label>
              <select
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                required
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>From Quotation (optional)</label>
              <select
                name="quotation"
                value={form.quotation}
                onChange={handleChange}
              >
                <option value="">None</option>
                {quotations.map((q) => (
                  <option key={q.id} value={q.id}>
                    QTN-{String(q.id).padStart(4, "0")} — {q.item_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Item Name *</label>
              <input
                name="item_name"
                value={form.item_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
            <div className="form-field">
              <label>Unit Price *</label>
              <input
                type="number"
                step="0.01"
                name="unit_price"
                value={form.unit_price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Expected Delivery Date</label>
              <input
                type="date"
                name="expected_delivery_date"
                value={form.expected_delivery_date}
                onChange={handleChange}
              />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Purchase Order"}
          </button>
        </form>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>PO No.</th>
              <th>Supplier</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
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
            {!loading && purchaseOrders.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
                  No purchase orders yet.
                </td>
              </tr>
            )}
            {purchaseOrders.map((po) => (
              <tr key={po.id}>
                <td className="cell-strong">
                  PO-{String(po.id).padStart(4, "0")}
                </td>
                <td>{po.supplier_name}</td>
                <td>{po.item_name}</td>
                <td>{po.quantity}</td>
                <td>Rs. {parseFloat(po.total_amount).toLocaleString()}</td>
                <td>
                  <span className={`status-pill ${po.status.toLowerCase()}`}>
                    {po.status}
                  </span>
                </td>
                <td>
                  <button
                    className="link-btn danger"
                    onClick={() => confirmDelete(po)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete PO-${String(deleteTarget?.id).padStart(4, "0")}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
}
