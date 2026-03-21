import React from "react";
import { useNavigate } from "react-router-dom";
import "./ReportSelection.css";

const Report = () => {
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
      <div className="report-header">
        <div className="report-header-inner">
          <div className="report-logo-box">🔍</div>
          <h1>
            Lost <span>@C</span> Found Management
          </h1>
        </div>
      </div>

      <div className="report-content">
        {/* Cards */}
        <div className="report-cards">
          <div className="report-card" onClick={() => navigate("/lost")}>
            <h2>Report Lost Item</h2>
            <img
              src="https://cdn-icons-png.flaticon.com/512/891/891462.png"
              alt="Report Lost Item"
            />
            <div className="report-card-footer lost-card-footer">
              Submit a lost item report
            </div>
          </div>

          <div className="report-card" onClick={() => navigate("/found")}>
            <h2>Report Found Item</h2>
            <img
              src="https://cdn-icons-png.flaticon.com/512/1048/1048941.png"
              alt="Report Found Item"
            />
            <div className="report-card-footer found-card-footer">
              Submit a found item report
            </div>
          </div>

          <div className="report-card" onClick={() => navigate("/browse")}>
            <h2>Browse Items</h2>
            <img
              src="https://cdn-icons-png.flaticon.com/512/622/622669.png"
              alt="Browse Items"
            />
            <div className="report-card-footer browse-card-footer">
              View lost &amp; found inventory
            </div>
          </div>
        </div>

        {/* Recent items section */}
        <div className="recent-wrapper">
          <div className="recent-column">
            <div className="recent-head">
              <h2>Recent Found Items</h2>
              <p>Items recently turned in.</p>
            </div>

            <div className="recent-items-grid">
              {recentFoundItems.map((item, index) => (
                <div className="recent-item-card" key={index}>
                  <img src={item.image} alt={item.name} />
                  <div className="recent-item-name">{item.name}</div>
                </div>
              ))}
            </div>

            <div className="see-more-row">
              <button
                className="see-more-btn"
                onClick={() => navigate("/browse?type=found")}
              >
                See More →
              </button>
            </div>
          </div>

          <div className="recent-column">
            <div className="recent-head">
              <h2>Recent Lost Items</h2>
              <p>Items recently reported missing.</p>
            </div>

            <div className="recent-items-grid">
              {recentLostItems.map((item, index) => (
                <div className="recent-item-card" key={index}>
                  <img src={item.image} alt={item.name} />
                  <div className="recent-item-name">{item.name}</div>
                </div>
              ))}
            </div>

            <div className="see-more-row">
              <button
                className="see-more-btn"
                onClick={() => navigate("/browse?type=lost")}
              >
                See More →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;