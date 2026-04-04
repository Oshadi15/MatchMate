import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "./userDashboard.css";
import {
  FaBoxOpen,
  FaUniversity,
  FaCommentDots,
  FaWhatsapp
} from "react-icons/fa";

function UserDashboard() {

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}") || {};
    } catch {
      return {};
    }
  }, []);

  const handleSendReport = () => {
    const phoneNumber = "+94766773745";
    const message = "Hello, I need help";
    const WhatsAppUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(WhatsAppUrl, "_blank");
  };

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

      <div className="ud-content">
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