import React, { useEffect, useState, useCallback } from "react";
import { getMyHelpRequests } from "../../services/helpApi";
import "./helpBoard.css";

export default function MyRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const requesterKey = localStorage.getItem("studentRequesterKey");

  const loadMyRequests = useCallback(async () => {
    if (!requesterKey) {
      setItems([]);
      return;
    }

    setLoading(true);

    try {
      const res = await getMyHelpRequests(requesterKey);
      setItems(res.data);
    } catch (error) {
      console.error("Failed to load my requests:", error);
      alert("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  }, [requesterKey]);

  useEffect(() => {
    loadMyRequests();
  }, [loadMyRequests]);

  return (
    <div className="help-board-page">
      <div className="help-board-container">
        <div className="help-board-header">
          <h2>My Support Requests</h2>
          <p className="help-board-subtitle">
            View the requests you have submitted.
          </p>
        </div>

        {!requesterKey ? (
          <div className="help-board-message">
            You have not submitted any requests yet.
          </div>
        ) : loading ? (
          <div className="help-board-message">Loading...</div>
        ) : items.length === 0 ? (
          <div className="help-board-message">
            No requests found for your account.
          </div>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}