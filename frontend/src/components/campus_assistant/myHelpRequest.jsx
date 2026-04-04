import React, { useEffect, useState, useCallback } from "react";
import { getMyHelpRequests } from "../../services/helpApi";
import "./myHelpRequest.css";

export default function MyHelpRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageMessage, setPageMessage] = useState("");

  const loadMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      setPageMessage("");

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setPageMessage("Please login first.");
        setRequests([]);
        return;
      }

      const requesterKey = user._id || user.email;

      if (!requesterKey) {
        setPageMessage("Logged user information is missing.");
        setRequests([]);
        return;
      }

      const response = await getMyHelpRequests(requesterKey);
      const data = response.data || response;

      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch my help requests", error);
      setPageMessage(
        error?.response?.data?.message || "Failed to load your help requests"
      );
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyRequests();
  }, [loadMyRequests]);

  return (
    <div className="my-requests-page">
      <div className="my-requests-container">
        <h1>My Help Requests</h1>
        <p className="my-requests-subtitle">
          Track your submitted help requests, view statuses, and read admin replies.
        </p>

        {loading ? (
          <p className="my-requests-message">Loading your requests...</p>
        ) : pageMessage ? (
          <p className="my-requests-message error">{pageMessage}</p>
        ) : requests.length === 0 ? (
          <p className="my-requests-message">No help requests found.</p>
        ) : (
          <div className="my-requests-grid">
            {requests.map((request) => (
              <div className="my-request-card" key={request._id}>
                <div className="request-top-row">
                  <h3>{request.title}</h3>
                  <span
                    className={
                      request.status === "RESOLVED"
                        ? "request-status resolved"
                        : request.status === "IN_PROGRESS"
                        ? "request-status progress"
                        : "request-status open"
                    }
                  >
                    {request.status?.replace("_", " ")}
                  </span>
                </div>

                <p><strong>Support Type:</strong> {request.supportType}</p>
                <p><strong>Priority:</strong> {request.priority}</p>
                <p><strong>Description:</strong> {request.description}</p>

                {request.document && (
                  <p>
                    <strong>Attached Document:</strong>{" "}
                    <a
                      href={`http://localhost:5000${request.document}`}
                      target="_blank"
                      rel="noreferrer"
                      className="document-link"
                    >
                      View Document
                    </a>
                  </p>
                )}

                <p>
                  <strong>Submitted On:</strong>{" "}
                  {request.createdAt
                    ? new Date(request.createdAt).toLocaleString()
                    : "N/A"}
                </p>

                <div
  className={`admin-reply-box ${
    request.adminReply ? "has-reply" : "no-reply-box"
  }`}
>
  <h4>Admin Reply</h4>
  {request.adminReply ? (
    <>
      <p className="reply-text">{request.adminReply}</p>
      {request.repliedAt && (
        <span className="reply-time">
          Replied on: {new Date(request.repliedAt).toLocaleString()}
        </span>
      )}
    </>
  ) : (
    <p className="no-reply-text">No reply yet from admin.</p>
  )}
</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}