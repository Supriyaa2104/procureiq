import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";
import "./SuppliersPage.css"; // reusing the same styles

const STATUSES = ["PENDING", "RECEIVED", "APPROVED", "REJECTED"];

export default function QuotationsPage() {
  const { accessToken } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    supplier: "",
    item_name: "",
    quantity: "",
    unit_price: "",
    status: "PENDING",
    notes: "",
  });

  const headers = { Authorization: `Bearer ${accessToken}` };

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get("/quotations/", { headers }),
      api.get("/suppliers/", { headers }),
    ])
      .then(([qRes, sRes]) => {
        setQuotations(qRes.data.results ?? qRes.data);
        setSuppliers(sRes.data.results ?? sRes.data);
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
      const payload = { ...form, unit_price: form.unit_price || null };
      await api.post("/quotations/", payload, { headers });
      setForm({
        supplier: "",
        item_name: "",
        quantity: "",
        unit_price: "",
        status: "PENDING",
        notes: "",
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Failed to add quotation.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (quotation) => {
    setDeleteTarget(quotation);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/quotations/${deleteTarget.id}/`, { headers });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert("Failed to delete quotation.");
    }
  };

  return (
    <Layout
      title="Quotations"
      subtitle="Request and track supplier quotations."
    >
      <div className="page-header" style={{ justifyContent: "flex-end" }}>
        <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Request Quotation"}
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
              <label>Unit Price (if known)</label>
              <input
                type="number"
                step="0.01"
                name="unit_price"
                value={form.unit_price}
                onChange={handleChange}
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
              <label>Notes</label>
              <input name="notes" value={form.notes} onChange={handleChange} />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Quotation"}
          </button>
        </form>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Supplier</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="empty-row">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && quotations.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No quotations yet.
                </td>
              </tr>
            )}
            {quotations.map((q) => (
              <tr key={q.id}>
                <td className="cell-strong">{q.item_name}</td>
                <td>{q.supplier_name}</td>
                <td>{q.quantity}</td>
                <td>{q.unit_price ? `Rs. ${q.unit_price}` : "—"}</td>
                <td>
                  <span className={`status-pill ${q.status.toLowerCase()}`}>
                    {q.status}
                  </span>
                </td>
                <td>
                  <button
                    className="link-btn danger"
                    onClick={() => confirmDelete(q)}
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
        title="Delete Quotation"
        message={`Are you sure you want to delete this quotation for "${deleteTarget?.item_name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
}
