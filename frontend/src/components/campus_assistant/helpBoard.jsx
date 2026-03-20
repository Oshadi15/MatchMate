import React, { useEffect, useState, useCallback } from "react";
import { getHelpRequests, deleteHelpRequest } from "../../services/helpApi";

export default function HelpBoard() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [supportType, setSupportType] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, []);

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
    <div style={{ padding: 20 }}>
      <h2>Student Support Board</h2>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 15,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search..."
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

        <button onClick={load}>Filter</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No support requests yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((x) => (
            <div
              key={x._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{x.title}</strong>
                <span>{x.status}</span>
              </div>

              <p style={{ margin: "6px 0" }}>
                <b>Type:</b> {x.supportType} | <b>Priority:</b> {x.priority}
              </p>

              <p style={{ margin: "6px 0" }}>{x.description}</p>

              <div style={{ fontSize: 12, color: "#555" }}>
                <b>Preferred:</b> {x.preferredContact}
                {x.preferredContact === "EMAIL" && x.contactEmail
                  ? ` | ${x.contactEmail}`
                  : ""}
                {x.preferredContact === "PHONE" && x.contactPhone
                  ? ` | ${x.contactPhone}`
                  : ""}
                {x.isAnonymous ? " | Anonymous" : ""}
              </div>

              <div style={{ marginTop: 10 }}>
                <button onClick={() => handleDelete(x._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}