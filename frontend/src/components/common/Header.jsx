import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import logoImg from "../../assets/f3.png";
import { FaUserCircle } from "react-icons/fa";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const [loggedUser, setLoggedUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      setLoggedUser(null);
      setIsLoggedIn(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setLoggedUser(parsed);
      setIsLoggedIn(Boolean(parsed && (parsed.email || parsed.name)));
    } catch {
      setLoggedUser(null);
      setIsLoggedIn(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

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
          <Link to="/" className={`mm-nav-link ${isActive("/")}`}>
            Home
          </Link>
          {isLoggedIn && (
            <>
              <Link to="/report" className={`mm-nav-link ${isActive("/report")}`}>
                Lost &amp; Found
              </Link>
              <Link
                to="/usermatches"
                className={`mm-nav-link ${isActive("/usermatches")}`}
              >
                My Matches
              </Link>
              <Link
                to="/campus-assistant"
                className={`mm-nav-link ${isActive("/campus-assistant")}`}
              >
                Campus Assistant
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="mm-nav-actions">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                className="mm-nav-btn ghost"
                onClick={() => navigate("/dashboard")}
                title={loggedUser?.name || "Profile"}
                aria-label="User profile"
              >
                <FaUserCircle size={20} />
              </button>

              <button
                type="button"
                className="mm-nav-btn ghost"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="mm-nav-btn ghost"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                className="mm-nav-btn primary"
                onClick={() => navigate("/signup")}
              >
                Register
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
}