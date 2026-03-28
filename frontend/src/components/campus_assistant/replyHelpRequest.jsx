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
      navigate("/help"); // back to help board
    } catch (err) {
      alert(err.response?.data?.message || "Reply failed");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!item) return <div style={{ padding: 20 }}>No request found.</div>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>Reply to Support Request</h2>

      <div style={{ background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #ddd" }}>
        <h3>{item.title}</h3>
        <p><b>Type:</b> {item.supportType} | <b>Priority:</b> {item.priority}</p>
        <p><b>Status:</b> {item.status}</p>
        <p><b>Description:</b> {item.description}</p>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ fontWeight: 700 }}>Admin Reply</label>
        <textarea
          rows={5}
          style={{ width: "100%", marginTop: 8, padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply here..."
        />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button
          onClick={handleSend}
          style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 800 }}
        >
          Send Reply
        </button>

        <button
          onClick={() => navigate("/help")}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: "#fff", fontWeight: 800 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}