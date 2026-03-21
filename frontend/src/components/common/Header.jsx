import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

// ✅ Use the SAME logo you used before in Home.jsx
import logoImg from "../../assets/f3.png";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <header className="mm-header">
      <div className="mm-header-inner">
        {/* Brand */}
        <div className="mm-brand" onClick={() => navigate("/")}>
          <img src={logoImg} alt="MatchMate Logo" className="mm-brand-logo" />
          <div className="mm-brand-text">
            <h3>MatchMate</h3>
            <p>Lost &amp; Found System</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="mm-nav-links">
          <Link to="/" className={`mm-nav-link ${isActive("/")}`}>Home</Link>
          <Link to="/report" className={`mm-nav-link ${isActive("/report")}`}>Lost &amp; Found</Link>
          <Link to="/campus-assistant" className={`mm-nav-link ${isActive("/campus-assistant")}`}>Campus Assistant</Link>
          <Link to="/contact" className={`mm-nav-link ${isActive("/contact")}`}>Contact</Link>
        </nav>

        {/* Actions */}
        <div className="mm-nav-actions">
          <button className="mm-nav-btn ghost" onClick={() => navigate("/login")}>
            Login
          </button>

          <button className="mm-nav-btn primary" onClick={() => navigate("/signup")}>
            Register
          </button>

          <button className="mm-nav-btn primary" onClick={() => navigate("/adminlogin")}>
            Admin Login
          </button>
        </div>
      </div>
    </header>
  );
}