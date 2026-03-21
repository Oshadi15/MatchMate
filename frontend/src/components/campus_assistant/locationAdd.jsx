import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./locationAdd.css";

const TYPES = ["BUILDING", "LAB", "LECTURE_HALL", "OFFICE", "SERVICE", "OTHER"];

export default function LocationAdd() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const emptyForm = {
    name: "",
    type: "BUILDING",
    building: "",
    floor: "",
    roomNumber: "",
    openHours: "",
    description: "",
    keywordsText: "",
    latitude: "",
    longitude: "",
    status: "ACTIVE",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setMsg("");
      const res = await API.get("/locations", { params: { status: "" } }); // load all
      setItems(res.data || []);
    } catch (e) {
      setMsg("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const parseKeywords = (text) => {
    // comma separated -> array
    return (text || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const validate = () => {
    if (form.name.trim().length < 2) return "Name is required";
    if (!form.type) return "Type is required";
    if (form.building.trim().length < 2) return "Building is required";
    return null;
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      type: item.type || "BUILDING",
      building: item.building || "",
      floor: item.floor || "",
      roomNumber: item.roomNumber || "",
      openHours: item.openHours || "",
      description: item.description || "",
      keywordsText: (item.keywords || []).join(", "),
      latitude: item.latitude === null || item.latitude === undefined ? "" : String(item.latitude),
      longitude: item.longitude === null || item.longitude === undefined ? "" : String(item.longitude),
      status: item.status || "ACTIVE",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    const payload = {
      name: form.name.trim(),
      type: form.type,
      building: form.building.trim(),
      floor: form.floor.trim(),
      roomNumber: form.roomNumber.trim(),
      openHours: form.openHours.trim(),
      description: form.description.trim(),
      keywords: parseKeywords(form.keywordsText),
      status: form.status,
      latitude: form.latitude === "" ? null : Number(form.latitude),
      longitude: form.longitude === "" ? null : Number(form.longitude),
    };

    try {
      setMsg("");
      if (editingId) {
        await API.put(`/locations/${editingId}`, payload);
        setMsg("Location updated.");
      } else {
        await API.post("/locations", payload);
        setMsg("Location added.");
      }
      cancelEdit();
      load();
    } catch (e2) {
      alert(e2.response?.data?.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    try {
      await API.delete(`/locations/${id}`);
      setMsg("Location deleted.");
      load();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="la-page">
      <div className="la-header">
        <h2>Location Admin</h2>
        <p>Manage campus locations (add, edit, delete). Students will search these.</p>
      </div>

      <div className="la-card">
        <div className="la-card-title">
          {editingId ? "Edit Location" : "Add New Location"}
        </div>

        <form className="la-form" onSubmit={save}>
          <div className="la-grid-2">
            <div className="la-field">
              <label>Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="e.g. Main Library"
              />
            </div>

            <div className="la-field">
              <label>Type *</label>
              <select name="type" value={form.type} onChange={onChange}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="la-field">
              <label>Building *</label>
              <input
                name="building"
                value={form.building}
                onChange={onChange}
                placeholder="e.g. New Building"
              />
            </div>

            <div className="la-field">
              <label>Floor</label>
              <input
                name="floor"
                value={form.floor}
                onChange={onChange}
                placeholder="e.g. 3"
              />
            </div>

            <div className="la-field">
              <label>Room Number</label>
              <input
                name="roomNumber"
                value={form.roomNumber}
                onChange={onChange}
                placeholder="e.g. B-302"
              />
            </div>

            <div className="la-field">
              <label>Open Hours</label>
              <input
                name="openHours"
                value={form.openHours}
                onChange={onChange}
                placeholder="e.g. Mon–Fri 8am–6pm"
              />
            </div>

            <div className="la-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={onChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="la-field">
              <label>Keywords (comma separated)</label>
              <input
                name="keywordsText"
                value={form.keywordsText}
                onChange={onChange}
                placeholder="e.g. library, books, study"
              />
            </div>

            <div className="la-field">
              <label>Latitude (optional)</label>
              <input
                name="latitude"
                value={form.latitude}
                onChange={onChange}
                placeholder="e.g. 6.9271"
              />
            </div>

            <div className="la-field">
              <label>Longitude (optional)</label>
              <input
                name="longitude"
                value={form.longitude}
                onChange={onChange}
                placeholder="e.g. 79.8612"
              />
            </div>
          </div>

          <div className="la-field">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              placeholder="Short description / directions..."
            />
          </div>

          <div className="la-actions">
            <button className="la-btn" type="submit">
              {editingId ? "Update Location" : "Add Location"}
            </button>

            {editingId && (
              <button className="la-btn-outline" type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>

          {msg && <div className="la-msg">{msg}</div>}
        </form>
      </div>

      <div className="la-list">
        <div className="la-list-head">
          <h3>All Locations</h3>
          {loading ? <span className="la-small">Loading...</span> : null}
        </div>

        <div className="la-table">
          <div className="la-row la-row-head">
            <div>Name</div>
            <div>Type</div>
            <div>Building</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {items.map((it) => (
            <div className="la-row" key={it._id}>
              <div className="la-strong">{it.name}</div>
              <div>{it.type}</div>
              <div>{it.building}</div>
              <div>
                <span className={`la-pill ${it.status === "ACTIVE" ? "ok" : "off"}`}>
                  {it.status}
                </span>
              </div>
              <div className="la-actions-inline">
                <button className="la-mini" type="button" onClick={() => startEdit(it)}>
                  Edit
                </button>
                <button className="la-mini danger" type="button" onClick={() => remove(it._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <div className="la-empty">No locations yet. Add one above.</div>
          )}
        </div>
      </div>
    </div>
  );
}