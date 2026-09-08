import { useState } from "react";
import Layout from "../components/Layout";
import SupplierPerformanceTab from "./analytics/SupplierPerformanceTab";
import SalesTab from "./analytics/SalesTab";
import InventoryTab from "./analytics/InventoryTab";
import "./SuppliersPage.css";
import "./analytics/AnalyticsTabs.css";

const TABS = [
  { id: "suppliers", label: "Supplier Performance" },
  { id: "sales", label: "Sales" },
  { id: "inventory", label: "Inventory" },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("suppliers");

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