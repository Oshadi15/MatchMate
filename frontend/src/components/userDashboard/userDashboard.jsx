import React from "react";
import { Link } from "react-router-dom";
import "./userDashboard.css";
import {
  FaBoxOpen,
  FaUniversity,
  FaCommentDots,
  FaWhatsapp
} from "react-icons/fa";

function UserDashboard() {

  const handleSendReport = () => {
    const phoneNumber = "+94766773745";
    const message = "Hello, I need help";
    const WhatsAppUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(WhatsAppUrl, "_blank");
  };

  return (
    <div className="admin-dashboard"> {/* reuse same style */}

      <div className="admin-overlay"></div>

      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="nav-logo-section">
          <h2>Lost and Found System</h2>
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/logout">Logout</Link>
        </div>

        <div className="whatsapp-btn-container">
          <button className="whatsapp-btn" onClick={handleSendReport}>
            <FaWhatsapp /> WhatsApp Support
          </button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="dashboard-content">
        <h1>Welcome, User</h1>
        <p className="dashboard-sub">Access all services from one place</p>

        <div className="dashboard-cards">

          {/* Row 1 */}
          <div className="card-row">

            <Link to="/report" className="card">
              <FaBoxOpen size={40} />
              <h3>Lost & Found</h3>
              <p>Report and browse items</p>
            </Link>

            <Link to="/campus-assistant" className="card">
              <FaUniversity size={40} />
              <h3>Campus Assistant</h3>
              <p>Get help & support</p>
            </Link>

            <Link to="/feedback" className="card">
              <FaCommentDots size={40} />
              <h3>Feedback</h3>
              <p>Share your experience</p>
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}

export default UserDashboard;