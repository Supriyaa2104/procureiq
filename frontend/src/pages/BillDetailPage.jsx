import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import ConfirmDialog from "../components/ConfirmDialog";
import "./SuppliersPage.css";
import "./BillDetailPage.css";

export default function BillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [itemForm, setItemForm] = useState({
    item: "",
    quantity: "",
    unit_price: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "CASH",
  });

  const loadBill = () => {
    setLoading(true);
    Promise.all([api.get(`/bills/${id}/`), api.get("/inventory-items/")])
      .then(([billRes, invRes]) => {
        setBill(billRes.data);
        setCustomerName(billRes.data.customer_name || "");
        setInventoryItems(invRes.data.results ?? invRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBill();
  }, [id]);

  const handleSaveCustomer = async () => {
    try {
      await api.patch(`/bills/${id}/`, { customer_name: customerName });
      loadBill();
    } catch (err) {
      alert("Failed to update customer name.");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/bill-items/", { bill: id, ...itemForm });
      setItemForm({ item: "", quantity: "", unit_price: "" });
      setShowItemForm(false);
      loadBill();
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

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/payments/", { bill: id, ...paymentForm });
      setPaymentForm({ amount: "", method: "CASH" });
      setShowPaymentForm(false);
      loadBill();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Failed to record payment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteItem = (item) => setDeleteTarget(item);

  const handleDeleteItem = async () => {
    try {
      await api.delete(`/bill-items/${deleteTarget.id}/`);
      setDeleteTarget(null);
      loadBill();
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  if (loading) {
    return (
      <Layout title="Bill Details">
        <p>Loading...</p>
      </Layout>
    );
  }

  if (!bill) {
    return (
      <Layout title="Bill Details">
        <p>Bill not found.</p>
      </Layout>
    );
  }

  const totalPaid = bill.payments.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0,
  );
  const rawBalance = parseFloat(bill.total_amount) - totalPaid;
  const balanceDue = Math.max(rawBalance, 0);
  const overpaidAmount = rawBalance < 0 ? Math.abs(rawBalance) : 0;
  return (
    <Layout
      title={`Bill BILL-${String(bill.id).padStart(4, "0")}`}
      subtitle="Manage items and payments for this bill."
    >
      <button
        className="link-btn"
        onClick={() => navigate("/billing")}
        style={{ marginBottom: 16 }}
      >
        ← Back to Billing
      </button>

      <div className="bill-summary">
        <div className="bill-summary-row">
          <div className="bill-field">
            <label>Customer Name</label>
            <div className="bill-inline-edit">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
              />
              <button className="link-btn" onClick={handleSaveCustomer}>
                Save
              </button>
            </div>
          </div>
          <div className="bill-stat">
            <span>Total</span>
            <strong>
              Rs. {parseFloat(bill.total_amount).toLocaleString()}
            </strong>
          </div>
          <div className="bill-stat">
            <span>Paid</span>
            <strong>Rs. {totalPaid.toLocaleString()}</strong>
          </div>
          <div className="bill-stat">
            <span>Balance Due</span>
            <strong className={balanceDue > 0 ? "due" : ""}>
              Rs. {balanceDue.toLocaleString()}
            </strong>
            {overpaidAmount > 0 && (
              <span
                style={{
                  fontSize: 11,
                  color: "#C9A24B",
                  fontWeight: 600,
                  display: "block",
                }}
              >
                Overpaid by Rs. {overpaidAmount.toLocaleString()}
              </span>
            )}
          </div>
          <div className="bill-stat">
            <span>Status</span>
            <span className={`status-pill ${bill.status.toLowerCase()}`}>
              {bill.status}
            </span>
          </div>
        </div>
      </div>

      <div
        className="page-header"
        style={{ justifyContent: "flex-end", marginTop: 24 }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="primary-btn"
            onClick={() => {
              setShowPaymentForm(!showPaymentForm);
              setShowItemForm(false);
            }}
          >
            {showPaymentForm ? "Cancel" : "Record Payment"}
          </button>
          <button
            className="primary-btn"
            onClick={() => {
              setShowItemForm(!showItemForm);
              setShowPaymentForm(false);
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
              <label>Item *</label>
              <select
                value={itemForm.item}
                onChange={(e) =>
                  setItemForm({ ...itemForm, item: e.target.value })
                }
                required
              >
                <option value="">Select item</option>
                {inventoryItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.current_stock} {i.unit} available)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Quantity *</label>
              <input
                type="number"
                step="0.01"
                value={itemForm.quantity}
                onChange={(e) =>
                  setItemForm({ ...itemForm, quantity: e.target.value })
                }
                required
                min="0.01"
              />
            </div>
            <div className="form-field">
              <label>Unit Price *</label>
              <input
                type="number"
                step="0.01"
                value={itemForm.unit_price}
                onChange={(e) =>
                  setItemForm({ ...itemForm, unit_price: e.target.value })
                }
                required
                min="0.01"
              />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Add Item"}
          </button>
        </form>
      )}

      {showPaymentForm && (
        <form className="supplier-form" onSubmit={handleAddPayment}>
          <div className="form-grid">
            <div className="form-field">
              <label>Amount *</label>
              <input
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
                required
                min="0.01"
              />
            </div>
            <div className="form-field">
              <label>Method *</label>
              <select
                value={paymentForm.method}
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, method: e.target.value })
                }
                required
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="ESEWA">eSewa</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : "Record Payment"}
          </button>
        </form>
      )}

      <div className="table-card" style={{ marginTop: 20 }}>
        <div className="dash-table-header">
          <h3>Items</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bill.items.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-row">
                  No items added yet.
                </td>
              </tr>
            )}
            {bill.items.map((it) => (
              <tr key={it.id}>
                <td className="cell-strong">{it.item_name}</td>
                <td>{it.quantity}</td>
                <td>Rs. {it.unit_price}</td>
                <td>Rs. {it.subtotal}</td>
                <td>
                  <button
                    className="link-btn danger"
                    onClick={() => confirmDeleteItem(it)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-card" style={{ marginTop: 20 }}>
        <div className="dash-table-header">
          <h3>Payments</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Method</th>
              <th>Recorded By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {bill.payments.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-row">
                  No payments recorded yet.
                </td>
              </tr>
            )}
            {bill.payments.map((p) => (
              <tr key={p.id}>
                <td className="cell-strong">Rs. {p.amount}</td>
                <td>{p.method}</td>
                <td>{p.recorded_by_username}</td>
                <td>{new Date(p.paid_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Bill Item"
        message={`Remove "${deleteTarget?.item_name}" from this bill? Note: this does NOT restore inventory stock automatically.`}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
}
