import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "home" },
  { label: "Suppliers", path: "/suppliers", icon: "users" },
  { label: "Quotations", path: "/quotations", icon: "file" },
  { label: "Purchase Orders", path: "/purchase-orders", icon: "cart" },
  { label: "Inventory", path: "/inventory", icon: "box" },
  { label: "Billing", path: "/billing", icon: "receipt" },
  { label: "Supplier Payments", path: "/supplier-payments", icon: "payment" },
  { label: "Analytics", path: "/analytics", icon: "chart" },
];

const icons = {
  home: <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />,
  users: <><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><path d="M17 3.5a4 4 0 0 1 0 7" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
  box: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05" /><path d="M12 22.08V12" /></>,
  receipt: <><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 1z" /><path d="M8 7h8M8 11h8M8 15h5" /></>,
  payment: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
  chart: <><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" /><rect x="12" y="8" width="3" height="10" /><rect x="17" y="5" width="3" height="13" /></>,
};

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">PQ</div>
        <span>ProcureIQ</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {icons[item.icon]}
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <div className="sidebar-username">{user?.username}</div>
            <div className="sidebar-role">{user?.role}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}