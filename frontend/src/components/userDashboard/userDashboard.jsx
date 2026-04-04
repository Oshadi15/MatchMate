import React, { useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./userDashboard.css";
import {
  FaBoxOpen,
  FaUniversity,
  FaCommentDots,
  FaWhatsapp,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar
} from "react-icons/fa";

function UserDashboard() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}") || {};
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("user")));
  }, []);

  const handleSendReport = () => {
    const phoneNumber = "+94773375366";
    const message = "Hello, I need help";
    const WhatsAppUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(WhatsAppUrl, "_blank");
  };

  if (!isLoggedIn) {
    return (
      <div className="ud-page">
        <div className="ud-hero">
          <div className="ud-hero-inner">
            <div className="ud-hero-text">
              <h1>Access Your Dashboard</h1>
              <p>Sign in to explore exclusive features</p>
            </div>
            <button className="ud-support" onClick={() => navigate("/login")} type="button">
              Sign In
            </button>
          </div>
        </div>

        <div className="ud-content">
          <div className="ud-guest-message">
            <h2>Join MatchMate Today!</h2>
            <p>Get access to Lost &amp; Found, Smart Matching, and Campus Assistant features by creating an account.</p>
            <div className="ud-guest-actions">
              <button className="ud-primary-btn" onClick={() => navigate("/login")}>
                Login
              </button>
              <button className="ud-secondary-btn" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </div>
            <p className="ud-guest-note">Browse items anonymously or unlock full features with an account →</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ud-page">
      <div className="ud-hero">
        <div className="ud-hero-inner">
          <div className="ud-hero-text">
            <h1>
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p>Access all services from one place</p>
          </div>

          <button className="ud-support" onClick={handleSendReport} type="button">
            <FaWhatsapp /> WhatsApp Support
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="ud-content">
        <div className="ud-profile-section">
          <div className="ud-profile-header">
            <div className="ud-profile-avatar">
              <FaUser size={32} />
            </div>
            <div className="ud-profile-info">
              <h2>{user?.name || "User"}</h2>
              <p className="ud-profile-role">Student Member</p>
            </div>
          </div>

          <div className="ud-profile-details">
            <div className="ud-detail-item">
              <FaEnvelope className="ud-detail-icon" />
              <div>
                <p className="ud-detail-label">Email</p>
                <p className="ud-detail-value">{user?.email || "Not provided"}</p>
              </div>
            </div>
            {user?.phone && (
              <div className="ud-detail-item">
                <FaPhone className="ud-detail-icon" />
                <div>
                  <p className="ud-detail-label">Phone</p>
                  <p className="ud-detail-value">{user.phone}</p>
                </div>
              </div>
            )}
            {user?.createdAt && (
              <div className="ud-detail-item">
                <FaCalendar className="ud-detail-icon" />
                <div>
                  <p className="ud-detail-label">Member Since</p>
                  <p className="ud-detail-value">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ud-content">
        <h3 className="ud-services-title">Your Services</h3>
        <div className="ud-grid">
          <Link to="/report" className="ud-card">
            <div className="ud-card-icon">
              <FaBoxOpen size={22} />
            </div>
            <div className="ud-card-body">
              <h3>Lost &amp; Found</h3>
              <p>Report and browse items</p>
            </div>
          </Link>

          <Link to="/campus-assistant" className="ud-card">
            <div className="ud-card-icon">
              <FaUniversity size={22} />
            </div>
            <div className="ud-card-body">
              <h3>Campus Assistant</h3>
              <p>Get help &amp; support</p>
            </div>
          </Link>

          <Link to="/usermatches" className="ud-card">
            <div className="ud-card-icon">
              <FaCommentDots size={22} />
            </div>
            <div className="ud-card-body">
              <h3>My Matches</h3>
              <p>View your matches</p>
            </div>
          </Link>

          <Link to="/feedback" className="ud-card">
            <div className="ud-card-icon">
              <FaCommentDots size={22} />
            </div>
            <div className="ud-card-body">
              <h3>Feedback</h3>
              <p>Share your experience</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default UserDashboard;