import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import "./locationFinder.css";

export default function LocationFinder() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [building, setBuilding] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selected, setSelected] = useState(null);

  const buildingOptions = useMemo(() => {
    const set = new Set();
    locations.forEach((l) => {
      if (l.building) set.add(l.building);
    });
    return Array.from(set).sort();
  }, [locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const params = {};
      if (q.trim()) params.q = q.trim();
      if (type) params.type = type;
      if (building) params.building = building;
      if (status) params.status = status;

      const res = await API.get("/locations", { params });
      setLocations(res.data || []);
    } catch (err) {
      setErrorMsg("Failed to load locations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    fetchLocations();
  };

  const clearFilters = () => {
    setQ("");
    setType("");
    setBuilding("");
    setStatus("ACTIVE");
    setSelected(null);
    // fetch again after clearing
    setTimeout(fetchLocations, 0);
  };

  return (
    <div className="lf-page">
      <div className="lf-header">
        <div>
          <h2 className="lf-title">Campus Location Finder</h2>
          <p className="lf-subtitle">
            Search campus places by name, building, room number, or keywords.
          </p>
        </div>
      </div>

      <form className="lf-filters" onSubmit={onSearch}>
        <div className="lf-search">
          <input
            className="lf-input"
            placeholder="Search (e.g. library, lab, B-302)..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="lf-btn" type="submit">
            Search
          </button>
        </div>

        <div className="lf-filter-row">
          <div className="lf-field">
            <label>Type</label>
            <select
              className="lf-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All</option>
              <option value="BUILDING">Building</option>
              <option value="LAB">Lab</option>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="OFFICE">Office</option>
              <option value="SERVICE">Service</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="lf-field">
            <label>Building</label>
            <select
              className="lf-select"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
            >
              <option value="">All</option>
              {buildingOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="lf-field">
            <label>Status</label>
            <select
              className="lf-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <button className="lf-btn-outline" type="button" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </form>

      <div className="lf-results">
        {loading && <div className="lf-info">Loading locations...</div>}
        {!loading && errorMsg && <div className="lf-error">{errorMsg}</div>}

        {!loading && !errorMsg && locations.length === 0 && (
          <div className="lf-info">
            No locations found. Try another search or clear filters.
          </div>
        )}

        <div className="lf-grid">
          {locations.map((loc) => (
            <button
              key={loc._id}
              className="lf-card"
              type="button"
              onClick={() => setSelected(loc)}
            >
              <div className="lf-card-top">
                <div className="lf-card-name">{loc.name}</div>
                <span className={`lf-badge ${loc.status === "ACTIVE" ? "ok" : "off"}`}>
                  {loc.status}
                </span>
              </div>

              <div className="lf-card-meta">
                <div>
                  <span className="lf-meta-label">Type:</span> {loc.type}
                </div>
                <div>
                  <span className="lf-meta-label">Building:</span> {loc.building}
                </div>
                {loc.floor ? (
                  <div>
                    <span className="lf-meta-label">Floor:</span> {loc.floor}
                  </div>
                ) : null}
                {loc.roomNumber ? (
                  <div>
                    <span className="lf-meta-label">Room:</span> {loc.roomNumber}
                  </div>
                ) : null}
              </div>

              {loc.keywords && loc.keywords.length > 0 && (
                <div className="lf-tags">
                  {loc.keywords.slice(0, 4).map((k, idx) => (
                    <span className="lf-tag" key={idx}>
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Details modal */}
      {selected && (
        <div className="lf-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="lf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="lf-modal-header">
              <h3 className="lf-modal-title">{selected.name}</h3>
              <button className="lf-x" type="button" onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            <div className="lf-modal-body">
              <div className="lf-detail-row">
                <div className="lf-detail">
                  <span>Type</span>
                  <strong>{selected.type}</strong>
                </div>
                <div className="lf-detail">
                  <span>Status</span>
                  <strong>{selected.status}</strong>
                </div>
              </div>

              <div className="lf-detail-row">
                <div className="lf-detail">
                  <span>Building</span>
                  <strong>{selected.building || "-"}</strong>
                </div>
                <div className="lf-detail">
                  <span>Room</span>
                  <strong>{selected.roomNumber || "-"}</strong>
                </div>
              </div>

              <div className="lf-detail-row">
                <div className="lf-detail">
                  <span>Floor</span>
                  <strong>{selected.floor || "-"}</strong>
                </div>
                <div className="lf-detail">
                  <span>Open Hours</span>
                  <strong>{selected.openHours || "-"}</strong>
                </div>
              </div>

              {selected.description ? (
                <div className="lf-desc">
                  <div className="lf-desc-title">Description</div>
                  <div className="lf-desc-text">{selected.description}</div>
                </div>
              ) : null}

              {selected.keywords && selected.keywords.length > 0 ? (
                <div className="lf-desc">
                  <div className="lf-desc-title">Keywords</div>
                  <div className="lf-tags">
                    {selected.keywords.map((k, idx) => (
                      <span className="lf-tag" key={idx}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {(selected.latitude && selected.longitude) ? (
                <div className="lf-coords">
                  Coordinates: {selected.latitude}, {selected.longitude}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}