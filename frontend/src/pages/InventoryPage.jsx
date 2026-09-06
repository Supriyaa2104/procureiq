import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ConfirmDialog";
import "./SuppliersPage.css";

const UNITS = ["kg", "litre", "piece", "packet", "gram", "dozen"];

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showMoveForm, setShowMoveForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [itemForm, setItemForm] = useState({
    name: "",
    unit: "kg",
    low_stock_threshold: "10",
  });
  const [moveForm, setMoveForm] = useState({
    item: "",
    movement_type: "IN",
    quantity: "",
    reason: "",
  });

  const loadItems = () => {
    setLoading(true);
    api
      .get("/inventory-items/")
      .then((res) => setItems(res.data.results ?? res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleItemChange = (e) =>
    setItemForm({ ...itemForm, [e.target.name]: e.target.value });
  const handleMoveChange = (e) =>
    setMoveForm({ ...moveForm, [e.target.name]: e.target.value });

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/inventory-items/", itemForm);
      setItemForm({ name: "", unit: "kg", low_stock_threshold: "10" });
      setShowItemForm(false);
      loadItems();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Failed to add item.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogMovement = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/stock-movements/", moveForm);
      setMoveForm({ item: "", movement_type: "IN", quantity: "", reason: "" });
      setShowMoveForm(false);
      loadItems();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Failed to log movement.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item) => setDeleteTarget(item);

  const handleDelete = async () => {
    try {
      await api.delete(`/inventory-items/${deleteTarget.id}/`);
      setDeleteTarget(null);
      loadItems();
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  return (
    <Layout
      title="Inventory"
      subtitle="Track stock levels and log stock movements."
    >
      <div className="page-header" style={{ justifyContent: "flex-end" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="primary-btn"
            onClick={() => {
              setShowMoveForm(!showMoveForm);
              setShowItemForm(false);
            }}
          >
            {showMoveForm ? "Cancel" : "↕ Log Movement"}
          </button>
          <button
            className="primary-btn"
            onClick={() => {
              setShowItemForm(!showItemForm);
              setShowMoveForm(false);
            }}
          >
            {showItemForm ? "Cancel" : "+ Add Item"}
          </button>
        </div>
      </div>

      {showItemForm && (
        <form className="supplier-form" onSubmit={handleAddItem}>
          <div className="form-grid">
            <div className="form-field">
              <label>Item Name *</label>
              <input
                name="name"
                value={itemForm.name}
                onChange={handleItemChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Unit *</label>
              <select
                name="unit"
                value={itemForm.unit}
                onChange={handleItemChange}
                required
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Low Stock Threshold</label>
              <input
                type="number"
                step="0.01"
                name="low_stock_threshold"
                value={itemForm.low_stock_threshold}
                onChange={handleItemChange}
              />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Item"}
          </button>
        </form>
      )}

      {showMoveForm && (
        <form className="supplier-form" onSubmit={handleLogMovement}>
          <div className="form-grid">
            <div className="form-field">
              <label>Item *</label>
              <select
                name="item"
                value={moveForm.item}
                onChange={handleMoveChange}
                required
              >
                <option value="">Select item</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Movement Type *</label>
              <select
                name="movement_type"
                value={moveForm.movement_type}
                onChange={handleMoveChange}
                required
              >
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>
            </div>
            <div className="form-field">
              <label>Quantity *</label>
              <input
                type="number"
                step="0.01"
                name="quantity"
                value={moveForm.quantity}
                onChange={handleMoveChange}
                required
                min="0.01"
              />
            </div>
            <div className="form-field">
              <label>Reason *</label>
              <input
                name="reason"
                placeholder="e.g. PO #3 delivered, Wastage"
                value={moveForm.reason}
                onChange={handleMoveChange}
                required
              />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Log Movement"}
          </button>
        </form>
      )}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Unit</th>
              <th>Current Stock</th>
              <th>Low Stock Threshold</th>
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
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No inventory items yet.
                </td>
              </tr>
            )}
            {items.map((i) => (
              <tr key={i.id}>
                <td className="cell-strong">{i.name}</td>
                <td>{i.unit}</td>
                <td>{i.current_stock}</td>
                <td>{i.low_stock_threshold}</td>
                <td>
                  <span
                    className={`status-pill ${i.is_low_stock ? "rejected" : "approved"}`}
                  >
                    {i.is_low_stock ? "Low Stock" : "OK"}
                  </span>
                </td>
                <td>
                  <button
                    className="link-btn danger"
                    onClick={() => confirmDelete(i)}
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
        title="Delete Inventory Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
}
