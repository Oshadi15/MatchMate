import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import API from "../../services/api";
import logo from "../../assets/f3.png";
import "./FeedbackInsert.css";

function FeedbackInsertPage() {
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    section: "",
    contact: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const [feedbacks, setFeedbacks] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getCreatedAt = (fb) => {
    if (fb?.createdAt) {
      const d = new Date(fb.createdAt);
      if (!Number.isNaN(d.getTime())) return d;
    }

    // Fallback: Mongo ObjectId timestamp (first 4 bytes).
    const id = fb?._id;
    if (typeof id === "string" && id.length >= 8) {
      const seconds = Number.parseInt(id.slice(0, 8), 16);
      if (Number.isFinite(seconds)) return new Date(seconds * 1000);
    }

    return null;
  };

  const formatDate = (d) => {
    if (!d) return "";
    try {
      return d.toLocaleString();
    } catch {
      return "";
    }
  };

  const fetchFeedbacks = useCallback(async () => {
    setListLoading(true);
    setListError("");

    try {
      const res = await API.get("/api/feedback/");
      const items = Array.isArray(res.data?.feedbacks) ? res.data.feedbacks : [];
      setFeedbacks(items);
    } catch (e) {
      if (e?.response?.status === 404) {
        setFeedbacks([]);
      } else {
        console.error("Failed to load feedbacks:", e);
        setListError("Failed to load recent feedback.");
        setFeedbacks([]);
      }
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const sortedFeedbacks = useMemo(() => {
    const withDates = feedbacks.map((fb) => ({ fb, d: getCreatedAt(fb) }));
    withDates.sort((a, b) => {
      const at = a.d ? a.d.getTime() : 0;
      const bt = b.d ? b.d.getTime() : 0;
      return bt - at;
    });
    return withDates;
  }, [feedbacks]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/feedback/", formData);
      setStatus("Feedback submitted successfully!");
      setFormData({
        name: "",
        gmail: "",
        section: "",
        contact: "",
        message: "",
      });

      fetchFeedbacks();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus("Failed to submit feedback.");
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-card">
        <div className="feedback-head">
          <div className="feedback-mark">
            <img src={logo} alt="MatchMate" />
          </div>
          <div className="feedback-title">
            <h2>
              <FontAwesomeIcon icon={faCommentDots} />
              Submit Your Feedback
            </h2>
            <p>Tell us what we can improve. We read every message.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="gmail"
            placeholder="Email Address"
            value={formData.gmail}
            onChange={handleChange}
            required
          />

          <select name="section" value={formData.section} onChange={handleChange} required>
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your Feedback"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            required
          ></textarea>

          <button type="submit">Submit Feedback</button>
        </form>

        {status && <p className="status-msg">{status}</p>}

        <div className="feedback-recent">
          <div className="feedback-recent-head">
            <div>
              <h3>Recent feedback</h3>
              <p>Latest messages shared by students.</p>
            </div>
            <span className="feedback-recent-meta">{feedbacks.length} total</span>
          </div>

          {listError ? <div className="feedback-recent-error">{listError}</div> : null}
          {listLoading ? <div className="feedback-recent-state">Loading feedback…</div> : null}

          {!listLoading && feedbacks.length === 0 ? (
            <div className="feedback-recent-state">No feedback yet. Be the first to share one.</div>
          ) : null}

          {!listLoading && feedbacks.length > 0 ? (
            <div className="feedback-list" role="list">
              {sortedFeedbacks.map(({ fb, d }) => {
                const name = (fb?.name || "Anonymous").trim() || "Anonymous";
                const sectionLabel = fb?.section ? `${fb.section} Year` : "";
                return (
                  <div key={fb._id} className="fb-item" role="listitem">
                    <div className="fb-top">
                      <div className="fb-ident">
                        <span className="fb-name">{name}</span>
                        {sectionLabel ? <span className="fb-badge">{sectionLabel}</span> : null}
                      </div>
                      <span className="fb-date">{formatDate(d)}</span>
                    </div>

                    <div className="fb-message">{fb?.message || "—"}</div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default FeedbackInsertPage;