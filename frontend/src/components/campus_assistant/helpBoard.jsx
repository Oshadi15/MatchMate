import React, { useEffect, useState, useCallback } from "react";
import { getHelpRequests, deleteHelpRequest } from "../../services/helpApi";
import "./helpBoard.css";

export default function HelpBoard() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [supportType, setSupportType] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getHelpRequests({ status, supportType, q });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load support requests:", err);
      alert("Failed to load support requests");
    } finally {
      setLoading(false);
    }
  }, [status, supportType, q]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this request?");
    if (!confirmed) return;

    try {
      await deleteHelpRequest(id);
      load();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed");
    }
  };

  return (
    <div className="help-board-page">
      <div className="help-board-container">
        <div className="help-board-header">
          <h2>Student Support Board</h2>
          <p className="help-board-subtitle">
            View, search, and manage submitted support requests.
          </p>
        </div>

        <div className="help-board-filters">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            value={supportType}
            onChange={(e) => setSupportType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="ACADEMIC">ACADEMIC</option>
            <option value="REGISTRATION">REGISTRATION</option>
            <option value="FACILITIES">FACILITIES</option>
            <option value="IT_SUPPORT">IT_SUPPORT</option>
            <option value="FINANCE">FINANCE</option>
            <option value="CLUBS_EVENTS">CLUBS & EVENTS</option>
            <option value="OTHER">OTHER</option>
          </select>

          <button className="help-board-filter-button" onClick={load}>
            Filter
          </button>
        </div>

        {loading ? (
          <div className="help-board-message">Loading...</div>
        ) : items.length === 0 ? (
          <div className="help-board-message">No support requests yet.</div>
        ) : (
          <div className="help-board-grid">
            {items.map((x) => (
              <div key={x._id} className="help-board-card">
                <div className="help-board-card-top">
                  <h3 className="help-board-title">{x.title}</h3>
                  <span className="help-board-status">{x.status}</span>
                </div>

                <p className="help-board-meta">
                  <b>Type:</b> {x.supportType} | <b>Priority:</b> {x.priority}
                </p>

                <p className="help-board-description">{x.description}</p>

                <div className="help-board-contact">
                  <b>Preferred:</b> {x.preferredContact}
                  {x.preferredContact === "EMAIL" && x.contactEmail
                    ? ` | ${x.contactEmail}`
                    : ""}
                  {x.preferredContact === "PHONE" && x.contactPhone
                    ? ` | ${x.contactPhone}`
                    : ""}
                  {x.isAnonymous ? " | Anonymous" : ""}
                </div>

                <div className="help-board-actions">
                  <button
                    className="help-board-delete-button"
                    onClick={() => handleDelete(x._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}