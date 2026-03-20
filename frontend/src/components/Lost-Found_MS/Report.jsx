import React from "react";
import { useNavigate } from "react-router-dom";
import "./ReportSelection.css";

const ReportSelection = () => {
  const navigate = useNavigate();

  const recentFoundItems = [
    {
      name: "Smartphone",
      image: "https://cdn-icons-png.flaticon.com/512/15/15874.png",
    },
    {
      name: "Car Keys",
      image: "https://cdn-icons-png.flaticon.com/512/806/806486.png",
    },
    {
      name: "Sunglasses",
      image: "https://cdn-icons-png.flaticon.com/512/921/921527.png",
    },
  ];

  const recentLostItems = [
    {
      name: "Laptop",
      image: "https://cdn-icons-png.flaticon.com/512/179/179386.png",
    },
    {
      name: "Teddy Bear",
      image: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    },
    {
      name: "Wallet",
      image: "https://cdn-icons-png.flaticon.com/512/2331/2331970.png",
    },
  ];

  return (
    <div className="report-page">
      {/* Header */}
      <div className="top-header">
        <div className="logo-circle">🔍</div>
        <h1>
          Lost <span>@C</span> Found Management
        </h1>
      </div>

      {/* Action Cards */}
      <div className="card-section">
        <div className="action-card" onClick={() => navigate("/lost")}>
          <h2>Report Lost Item</h2>
          <img
            src="https://cdn-icons-png.flaticon.com/512/891/891462.png"
            alt="Report Lost Item"
          />
          <div className="card-footer lost-footer">
            Submit a lost item report.
          </div>
        </div>

        <div className="action-card" onClick={() => navigate("/found")}>
          <h2>Report Found Item</h2>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1048/1048941.png"
            alt="Report Found Item"
          />
          <div className="card-footer found-footer">
            Submit a found item report.
          </div>
        </div>

        <div className="action-card" onClick={() => navigate("/browse")}>
          <h2>Browse Items</h2>
          <img
            src="https://cdn-icons-png.flaticon.com/512/622/622669.png"
            alt="Browse Items"
          />
          <div className="card-footer browse-footer">
            View lost & found inventory.
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="recent-section">
        <div className="recent-column">
          <h2>Recent Found Items</h2>
          <p>Items recently turned in.</p>
          <div className="items-grid">
            {recentFoundItems.map((item, index) => (
              <div className="item-card" key={index}>
                <img src={item.image} alt={item.name} />
                <div className="item-name">{item.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-column">
          <h2>Recent Lost Items</h2>
          <p>Items recently reported missing.</p>
          <div className="items-grid">
            {recentLostItems.map((item, index) => (
              <div className="item-card" key={index}>
                <img src={item.image} alt={item.name} />
                <div className="item-name">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportSelection;