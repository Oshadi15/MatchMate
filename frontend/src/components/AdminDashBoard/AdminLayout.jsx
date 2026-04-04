import React, { useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaChartPie,
  FaChartLine,
  FaSearch,
  FaTasks,
  FaRobot,
  FaCommentDots,
  FaSignOutAlt,
  FaWhatsapp,
} from "react-icons/fa";

import "./AdminLayout.css";

function getStoredAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    return user?.role === "admin" ? user : admin?.role === "admin" ? admin : null;
  } catch {
    return null;
  }
}

export default function AdminLayout({ title, subtitle, children, actions }) {
  const navigate = useNavigate();
  const location = useLocation();

  const admin = useMemo(() => getStoredAdmin(), []);

  useEffect(() => {
    // Simple guard: if not logged in as admin, send to admin login.
    if (!admin) {
      navigate("/adminlogin", { replace: true, state: { from: location.pathname } });
    }
  }, [admin, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    navigate("/adminlogin", { replace: true });
  };

  const handleWhatsAppSupport = () => {
    const phoneNumber = "+94766773745";
    const message = "Hello, I need support regarding the Lost and Found system.";
    const url = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const navItems = [
    { to: "/admin", label: "Dashboard", icon: <FaChartPie /> },
    { to: "/admin/analysis", label: "Analysis", icon: <FaChartLine /> },
    { to: "/adminbrowse", label: "Items (Browse)", icon: <FaSearch /> },
    { to: "/admin/lostfound", label: "Items (Manage)", icon: <FaTasks /> },
    { to: "/adminmatches", label: "Smart Matching", icon: <FaRobot /> },
    { to: "/admin/feedback", label: "Feedback", icon: <FaCommentDots /> },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">MM</div>
          <div className="admin-brand-text">
            <div className="admin-brand-title">MatchMate</div>
            <div className="admin-brand-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "admin-nav-item admin-nav-item--active" : "admin-nav-item"
              }
              end={item.to === "/admin"}
            >
              <span className="admin-nav-icn">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-actions">
          <button className="admin-side-btn admin-side-btn--whatsapp" onClick={handleWhatsAppSupport}>
            <FaWhatsapp /> WhatsApp Support
          </button>

          <button className="admin-side-btn admin-side-btn--logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1 className="admin-title">{title || "Admin"}</h1>
            {subtitle ? <p className="admin-subtitle">{subtitle}</p> : null}
          </div>
          <div className="admin-topbar-right">{actions || null}</div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
