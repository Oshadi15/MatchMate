import React from "react";
import { useNavigate } from "react-router-dom";
//import "./ReportSelection.css";

const ReportSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="report-container">
      <h1>Lost & Found Management</h1>
      <p>Select what you want to report</p>

      <div className="button-group">
        <button
          className="lost-btn"
          onClick={() => navigate("/lost")}
        >
          Report Lost Item
        </button>

        <button
          className="found-btn"
          onClick={() => navigate("/found")}
        >
          Report Found Item
        </button>
      </div>
    </div>
  );
};

export default ReportSelection;