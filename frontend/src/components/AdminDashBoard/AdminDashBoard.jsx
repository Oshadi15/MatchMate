import React from "react";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaSearch,
  FaTasks,
  FaRobot,
  FaCommentDots,
} from "react-icons/fa";

import AdminLayout from "./AdminLayout";
import "./AdminDashBoard.css";

function AdminDashboard() {
  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Navigate using the sidebar to manage MatchMate"
    >
      <div className="admin-home-grid">
        <Link to="/admin/analysis" className="admin-home-card">
          <div className="admin-home-icn"><FaChartLine /></div>
          <div>
            <h3>Analysis</h3>
            <p>View KPIs and insights across modules</p>
          </div>
        </Link>

        <Link to="/adminbrowse" className="admin-home-card">
          <div className="admin-home-icn"><FaSearch /></div>
          <div>
            <h3>Items (Browse)</h3>
            <p>Review reported lost & found items</p>
          </div>
        </Link>

        <Link to="/admin/lostfound" className="admin-home-card">
          <div className="admin-home-icn"><FaTasks /></div>
          <div>
            <h3>Items (Manage)</h3>
            <p>Edit, approve, reject, or remove items</p>
          </div>
        </Link>

         <Link to="/help" className="admin-home-card">
          <div className="admin-home-icn"><FaTasks /></div>
          <div>
            <h3>Help Board</h3>
            <p>Reply to help requests from users</p>
          </div>
        </Link>

         <Link to="/manage-location" className="admin-home-card">
          <div className="admin-home-icn"><FaTasks /></div>
          <div>
            <h3>Manage Location</h3>
            <p>Admin can manage locations so students can easily find important places inside the university.</p>
          </div>
        </Link>


        <Link to="/adminmatches" className="admin-home-card">
          <div className="admin-home-icn"><FaRobot /></div>
          <div>
            <h3>Smart Matching</h3>
            <p>Run scoring and review AI match results</p>
          </div>
        </Link>

        <Link to="/admin/feedback" className="admin-home-card">
          <div className="admin-home-icn"><FaCommentDots /></div>
          <div>
            <h3>Feedback</h3>
            <p>View and manage student feedback</p>
          </div>
        </Link>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;