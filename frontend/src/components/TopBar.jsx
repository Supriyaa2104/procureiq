import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import "./TopBar.css";

export default function TopBar({ title, subtitle }) {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get("/inventory-items/low-stock/")
      .then((res) => setLowStockItems(res.data.results ?? res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="topbar-actions" ref={dropdownRef}>
        <button className="bell-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {lowStockItems.length > 0 && (
            <span className="bell-badge">{lowStockItems.length}</span>
          )}
        </button>

        {dropdownOpen && (
          <div className="bell-dropdown">
            <div className="bell-dropdown-header">Low Stock Alerts</div>
            {lowStockItems.length === 0 ? (
              <div className="bell-dropdown-empty">All stock levels are healthy 🎉</div>
            ) : (
              <div className="bell-dropdown-list">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="bell-dropdown-item">
                    <div className="bell-item-icon">⚠</div>
                    <div>
                      <div className="bell-item-name">{item.name}</div>
                      <div className="bell-item-detail">
                        {item.current_stock} {item.unit} left (threshold: {item.low_stock_threshold})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}