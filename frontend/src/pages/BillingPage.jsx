import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import "./SuppliersPage.css";
import ConfirmDialog from "../components/ConfirmDialog";

export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const loadBills = () => {
    setLoading(true);
    api
      .get("/bills/")
      .then((res) => setBills(res.data.results ?? res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleNewBill = async () => {
    setCreating(true);
    try {
      const res = await api.post("/bills/", { customer_name: "" });
      navigate(`/billing/${res.data.id}`);
    } catch (err) {
      alert("Failed to create bill.");
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = (bill) => setDeleteTarget(bill);

  const handleDelete = async () => {
    try {
      await api.delete(`/bills/${deleteTarget.id}/`);
      setDeleteTarget(null);
      loadBills();
    } catch (err) {
      alert("Failed to delete bill.");
    }
  };

  return (
    <Layout title="Billing" subtitle="Create and manage customer bills.">
      <div className="page-header" style={{ justifyContent: "flex-end" }}>
        <button
          className="primary-btn"
          onClick={handleNewBill}
          disabled={creating}
        >
          {creating ? "Creating..." : "+ New Bill"}
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Bill No.</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
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
            {!loading && bills.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-row">
                  No bills yet. Click "New Bill" to create one.
                </td>
              </tr>
            )}
            {bills.map((b) => (
              <tr key={b.id}>
                <td className="cell-strong">
                  BILL-{String(b.id).padStart(4, "0")}
                </td>
                <td>{b.customer_name || "Walk-in"}</td>
                <td>Rs. {parseFloat(b.total_amount).toLocaleString()}</td>
                <td>
                  <span className={`status-pill ${b.status.toLowerCase()}`}>
                    {b.status}
                  </span>
                </td>
                <td>{new Date(b.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="link-btn"
                    onClick={() => navigate(`/billing/${b.id}`)}
                  >
                    Open
                  </button>
                </td>
                <td>
                  <button
                    className="link-btn danger"
                    onClick={() => confirmDelete(b)}
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
        title="Delete Bill"
        message={`Are you sure you want to delete BILL-${String(deleteTarget?.id).padStart(4, "0")}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Layout>
  );
}
