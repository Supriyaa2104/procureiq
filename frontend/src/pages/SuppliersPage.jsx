import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";
import "./SuppliersPage.css";

const CATEGORIES = [
  "Vegetables",
  "Meat",
  "Dairy",
  "Beverages",
  "Packaging",
  "Grains",
  "Spices",
  "Other",
];

export default function SuppliersPage() {
  const { accessToken, user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "PROCUREMENT_STAFF";

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    phone_number: "",
    email: "",
    address: "",
    category: "Vegetables",
  });

  const headers = { Authorization: `Bearer ${accessToken}` };

  const loadSuppliers = () => {
    setLoading(true);
    api
      .get("/suppliers/", { headers })
      .then((res) => setSuppliers(res.data.results ?? res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/suppliers/", form, { headers });
      setForm({
        name: "",
        contact_person: "",
        phone_number: "",
        email: "",
        address: "",
        category: "Vegetables",
      });
      setShowForm(false);
      loadSuppliers();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Failed to add supplier.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (supplier) => {
    setDeleteTarget(supplier);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/suppliers/${deleteTarget.id}/`, { headers });
      setDeleteTarget(null);
      loadSuppliers();
    } catch (err) {
      alert("Failed to delete supplier.");
    }
  };

  return (
    <Layout
      title="Suppliers"
      subtitle="Manage your supplier list and contact details."
    >
      <div className="page-header" style={{ justifyContent: "flex-end" }}>
        {canEdit && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add Supplier"}
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <form className="supplier-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Contact Person</label>
              <input
                name="contact_person"
                value={form.contact_person}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Phone Number *</label>
              <input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Supplier"}
          </button>
        </form>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
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
            {!loading && suppliers.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
                  No suppliers yet. Click "Add Supplier" to create one.
                </td>
              </tr>
            )}
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td className="cell-strong">{s.name}</td>
                <td>{s.category}</td>
                <td>{s.contact_person || "—"}</td>
                <td>{s.phone_number}</td>
                <td>{s.email || "—"}</td>
                <td>
                  <span
                    className={`status-pill ${s.is_active ? "approved" : "rejected"}`}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {canEdit && (
                    <button
                      className="link-btn danger"
                      onClick={() => confirmDelete(s)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
}