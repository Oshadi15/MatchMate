import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHelpRequestById, replyToHelpRequest } from "../../services/helpApi";
import "./replyHelpRequest.css";

export default function ReplyHelpRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const loadOne = async () => {
    try {
      setLoading(true);
      const res = await getHelpRequestById(id);
      setItem(res.data);
      setReply(res.data.adminReply || "");
    } catch (err) {
      alert("Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOne();
    // eslint-disable-next-line
  }, [id]);

  const handleSend = async () => {
    if (reply.trim().length < 2) {
      alert("Reply must be at least 2 characters");
      return;
    }

    try {
      await replyToHelpRequest(id, reply.trim());
      alert("Reply sent!");
      navigate("/help");
    } catch (err) {
      alert(err.response?.data?.message || "Reply failed");
    }
  };

  if (loading) return <div className="rhr-loading">Loading...</div>;
  if (!item) return <div className="rhr-empty">No request found.</div>;

  const statusClass =
    item.status === "OPEN"
      ? "open"
      : item.status === "IN_PROGRESS"
      ? "progress"
      : item.status === "RESOLVED"
      ? "resolved"
      : "";

  return (
    <div className="rhr-page">
      <div className="rhr-container">
        <h2 className="rhr-title">Reply to Support Request</h2>
        <p className="rhr-sub">Review the request details and send an admin reply.</p>

        <div className="rhr-card">
          <h3>{item.title}</h3>

          <p className="rhr-meta">
            <b>Type:</b> {item.supportType} | <b>Priority:</b> {item.priority}
          </p>

          <div className="rhr-badges">
            <span className={`rhr-badge ${statusClass}`}>{item.status}</span>
          </div>

          <p className="rhr-desc">
            <b>Description:</b> {item.description}
          </p>

          <div className="rhr-section">
            <label className="rhr-label">Admin Reply</label>
            <textarea
              className="rhr-textarea"
              rows={5}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply here..."
            />
          </div>

          <div className="rhr-actions">
            <button className="rhr-btn" onClick={handleSend}>
              Send Reply
            </button>

            <button className="rhr-btn-outline" onClick={() => navigate("/help")}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}