import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SuppliersPage from "./pages/SuppliersPage";
import QuotationsPage from "./pages/QuotationsPage";
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import InventoryPage from "./pages/InventoryPage";
import BillingPage from "./pages/BillingPage";
import BillDetailPage from "./pages/BillDetailPage";
import { useAuth } from "./context/AuthContext";
import SupplierPerformancePage from "./pages/SupplierPerformancePage";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={user ? <DashboardPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/suppliers"
        element={user ? <SuppliersPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/quotations"
        element={user ? <QuotationsPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/purchase-orders"
        element={user ? <PurchaseOrdersPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/inventory"
        element={user ? <InventoryPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/billing"
        element={user ? <BillingPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/billing/:id"
        element={user ? <BillDetailPage /> : <Navigate to="/login" />}
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} />}
      />
      <Route
        path="/analytics"
        element={user ? <SupplierPerformancePage /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
