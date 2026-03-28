import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashBoard.css";

import {
  FaUsers,
  FaWarehouse,
  FaMoneyBillWave,
  FaTruck,
  FaFileInvoiceDollar,
  FaMoneyBill,
  FaOilCan,
  FaStar,
  FaCommentDots,
  FaComments,
  FaWhatsapp,
} from "react-icons/fa";

function AdminDashboard() {

  const stockId = localStorage.getItem("stockId");

  /* ================= WHATSAPP SUPPORT ================= */
  const handleSendReport = () => {
    const phoneNumber = "+94766773745";
    const message = `Hello, I need support regarding the Lost and Found system.`;
    const WhatsAppUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;
    window.open(WhatsAppUrl, "_blank");
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-overlay"></div>

      {/* ================= NAVBAR ================= */}
      <nav className="dashboard-nav">
        <div className="nav-logo-section">
          <h2>Lost and Found System</h2>
        </div>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/adminlogin">Logout</Link>
        </div>

        <div className="whatsapp-btn-container">
          <button className="whatsapp-btn" onClick={handleSendReport}>
            <FaWhatsapp /> WhatsApp Support
          </button>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <div className="dashboard-content">
        <h1>Welcome, Admin</h1>
        <p className="dashboard-sub">Manage everything from one place</p>

        <div className="dashboard-cards">

          {/* ================= ROW 1 ================= */}
          <div className="card-row">

            <Link to={`/displaystock/${stockId}`} className="card">
              <FaWarehouse size={40} />
              <h3>Campus Locations</h3>
              <p>View campus locations</p>
            </Link>

            {/* ✅ LOST & FOUND MANAGEMENT */}
            <Link to="/admin/lostfound" className="card">
              <FaMoneyBillWave size={40} />
              <h3>Lost & Found</h3>
              <p>Manage lost & found items</p>
            </Link>

            <Link to="/recordsale" className="card">
              <FaTruck size={40} />
              <h3>Claim Requests</h3>
              <p>Manage claim requests</p>
            </Link>

          </div>

          {/* ================= ROW 2 ================= */}
          <div className="card-row">

            <Link to="/sales" className="card">
              <FaFileInvoiceDollar size={40} />
              <h3>User Management</h3>
              <p>Manage system users</p>
            </Link>

            <Link to="/summary" className="card">
              <FaMoneyBill size={40} />
              <h3>Income</h3>
              <p>Check daily income</p>
            </Link>

            <Link to="/fuel-levels" className="card">
              <FaOilCan size={40} />
              <h3>Smart Machine</h3>
              <p>Monitor machine status</p>
            </Link>

          </div>

          {/* ================= ROW 3 ================= */}
          <div className="card-row">

            <Link to="/help" className="card">
              <FaUsers size={40} />
              <h3>Help Board</h3>
              <p>Manage student help requests</p>
            </Link>

            {/* ✅ MAIN LOST & FOUND ADMIN ACCESS */}
            <Link to="/admin/lostfound" className="card">
              <FaStar size={40} />
              <h3>Lost & Found Management</h3>
              <p>Edit, delete & manage item status</p>
            </Link>

            <Link to="/feedback" className="card">
              <FaCommentDots size={40} />
              <h3>Feedbacks</h3>
              <p>View student feedback</p>
            </Link>

          </div>

          {/* ================= ROW 4 ================= */}
          <div className="card-row">

            <Link to="/adminchat" className="card">
              <FaComments size={40} />
              <h3>Student Chat</h3>
              <p>View conversations</p>
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;