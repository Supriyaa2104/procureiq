import { useState } from "react";
import Layout from "../components/Layout";
import SupplierPerformanceTab from "./analytics/SupplierPerformanceTab";
import SalesTab from "./analytics/SalesTab";
import InventoryTab from "./analytics/InventoryTab";
import { useAuth } from "../context/AuthContext";
import "./SuppliersPage.css";
import "./analytics/AnalyticsTabs.css";

const ALL_TABS = [
  { id: "suppliers", label: "Supplier Performance", hiddenFor: ["CASHIER"] },
  { id: "sales", label: "Sales", hiddenFor: ["PROCUREMENT_STAFF"] },
  { id: "inventory", label: "Inventory", hiddenFor: [] },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const TABS = ALL_TABS.filter((tab) => !tab.hiddenFor.includes(user?.role));
  const [activeTab, setActiveTab] = useState(TABS[0]?.id);

  return (
    <Layout title="Analytics" subtitle="Performance, sales, and inventory insights.">
      <div className="analytics-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`analytics-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "suppliers" && <SupplierPerformanceTab />}
      {activeTab === "sales" && <SalesTab />}
      {activeTab === "inventory" && <InventoryTab />}
    </Layout>
  );
}