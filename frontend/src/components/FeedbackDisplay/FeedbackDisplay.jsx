import React, { useEffect, useMemo, useState } from "react";
import "./FeedbackDisplay.css";
import API from "../../services/api";
import AdminLayout from "../AdminDashBoard/AdminLayout";

function safeDateString(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function FeedbackDisplayPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterSection, setFilterSection] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/api/feedback/");
      setFeedbacks(Array.isArray(res.data?.feedbacks) ? res.data.feedbacks : []);
    } catch (e) {
      // Backend may return 404 if empty
      if (e?.response?.status === 404) {
        setFeedbacks([]);
      } else {
        console.error("Failed to fetch feedbacks:", e);
        setError("Failed to load feedbacks");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this feedback?");
    if (!ok) return;
    try {
      await API.delete(`/api/feedback/${id}`);
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (e) {
      console.error("Failed to delete feedback:", e);
      setError("Failed to delete feedback");
    }
  };

  const sections = useMemo(() => {
    const out = new Set();
    for (const f of feedbacks) {
      if (f?.section) out.add(f.section);
    }
    return Array.from(out);
  }, [feedbacks]);

  const displayedFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchSection = filterSection ? f.section === filterSection : true;
      const matchDate = searchDate
        ? new Date(f.createdAt).toISOString().slice(0, 10) === searchDate
        : true;
      return matchSection && matchDate;
    });
  }, [feedbacks, filterSection, searchDate]);

  return (
    <AdminLayout
      title="Feedback"
      subtitle="Review and manage student feedback"
      actions={
        <button className="admin-btn admin-btn--primary" onClick={fetchFeedbacks}>
          Refresh
        </button>
      }
    >
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Feedback list</h3>
          <span className="fb-meta">{displayedFeedbacks.length} records</span>
        </div>

        <div className="admin-card-body">
          <div className="fb-filters">
            <select
              className="fb-input"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              className="fb-input"
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />

            <button
              className="admin-btn"
              onClick={() => {
                setFilterSection("");
                setSearchDate("");
              }}
            >
              Clear
            </button>
          </div>

          {error ? <p className="fb-error">{error}</p> : null}
          {loading ? <p className="fb-state">Loading feedbacks…</p> : null}

          {!loading && displayedFeedbacks.length === 0 ? (
            <p className="fb-state">No feedbacks available.</p>
          ) : null}

          {!loading && displayedFeedbacks.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Section</th>
                    <th>Contact</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th style={{ width: 120 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedFeedbacks.map((fb) => (
                    <tr key={fb._id}>
                      <td>{fb.name || "—"}</td>
                      <td className="fb-email">{fb.gmail || "—"}</td>
                      <td>{fb.section || "—"}</td>
                      <td>{fb.contact || "—"}</td>
                      <td className="fb-msg">{fb.message || "—"}</td>
                      <td>{safeDateString(fb.createdAt)}</td>
                      <td>
                        <button
                          className="admin-btn admin-btn--danger"
                          onClick={() => handleDelete(fb._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}
