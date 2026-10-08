import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./TopBar.css";

export default function TopBar({ title, subtitle }) {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    api.get("/inventory-items/low-stock/")
      .then((res) => {
        setLowStockItems(res.data.results ?? res.data);
        setLoadError(false);
      })
      .catch((err) => {
        console.error("Failed to load low stock alerts:", err);
        setLoadError(true);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(() => {
      api
        .get("/search/", { params: { q: trimmed } })
        .then((res) => setSearchResults(res.data))
        .catch((err) => {
          console.error("Search failed:", err);
          setSearchResults(null);
        })
        .finally(() => setSearchLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const hasResults =
    searchResults &&
    (searchResults.suppliers.length > 0 ||
      searchResults.purchase_orders.length > 0 ||
      searchResults.inventory_items.length > 0);

  const goTo = (path) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults(null);
    navigate(path);
  };

  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="topbar-actions" ref={dropdownRef}>
        <div className="topbar-search" ref={searchRef}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search suppliers, POs, items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
          />

          {searchOpen && searchQuery.trim() && (
            <div className="search-dropdown">
              {searchLoading ? (
                <div className="bell-dropdown-empty">Searching...</div>
              ) : !hasResults ? (
                <div className="bell-dropdown-empty">
                  No matches for "{searchQuery.trim()}"
                </div>
              ) : (
                <>
                  {searchResults.suppliers.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-label">Suppliers</div>
                      {searchResults.suppliers.map((s) => (
                        <div
                          key={`s-${s.id}`}
                          className="search-result-item"
                          onClick={() => goTo("/suppliers")}
                        >
                          <span className="search-result-title">{s.name}</span>
                          <span className="search-result-meta">{s.category}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.purchase_orders.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-label">Purchase Orders</div>
                      {searchResults.purchase_orders.map((po) => (
                        <div
                          key={`po-${po.id}`}
                          className="search-result-item"
                          onClick={() => goTo("/purchase-orders")}
                        >
                          <span className="search-result-title">{po.item_name}</span>
                          <span className="search-result-meta">
                            {po.supplier_name} · {po.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.inventory_items.length > 0 && (
                    <div className="search-group">
                      <div className="search-group-label">Inventory</div>
                      {searchResults.inventory_items.map((item) => (
                        <div
                          key={`i-${item.id}`}
                          className="search-result-item"
                          onClick={() => goTo("/inventory")}
                        >
                          <span className="search-result-title">{item.name}</span>
                          <span className="search-result-meta">
                            {item.current_stock} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

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
            {loadError ? (
              <div className="bell-dropdown-empty">Couldn't load stock alerts. Try again later.</div>
            ) : lowStockItems.length === 0 ? (
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