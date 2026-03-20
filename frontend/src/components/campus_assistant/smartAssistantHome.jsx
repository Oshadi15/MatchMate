import React from "react";
import { useNavigate } from "react-router-dom";
import "./smartAssistantHome.css";

export default function CampusAssistantHome() {
  const navigate = useNavigate();

  return (
    <div className="ca-page">
      <header className="ca-header">
        <div className="ca-header-inner">
          <div className="ca-brand">
            <div className="ca-bot">🤖</div>
            <h1 className="ca-title">
              Campus <span className="ca-title-accent">Assistant</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="ca-content">
        <div className="ca-cards">
          <button
            className="ca-card"
            onClick={() => navigate("/campus-assistant/locations")}
            type="button"
          >
            <div className="ca-card-body">
              <h2 className="ca-card-title">Campus Location Finder</h2>
              <div className="ca-card-icon">📍</div>
            </div>
            <div className="ca-card-footer">Find locations on campus</div>
          </button>

          <button
            className="ca-card"
            onClick={() => navigate("/campus-assistant/help")}
            type="button"
          >
            <div className="ca-card-body">
              <h2 className="ca-card-title">Student Help Board</h2>
              <div className="ca-card-icon">🧾</div>
            </div>
            <div className="ca-card-footer">Request help or assistance</div>
          </button>
        </div>
      </main>
    </div>
  );
}