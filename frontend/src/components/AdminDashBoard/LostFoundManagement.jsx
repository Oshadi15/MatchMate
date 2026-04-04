import { useEffect, useState } from "react";
import axios from "axios";
import "./LostFoundManagement.css";
import AdminLayout from "./AdminLayout";

export default function LostFoundManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    itemName: "",
    category: "",
    color: "",
    location: "",
    description: "",
    status: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/lostfound/items"
      );

      setItems(Array.isArray(res.data) ? res.data : []);
      setMsg("");
    } catch (err) {
      console.error("Fetch items error:", err.response?.data || err.message);
      setMsg("Failed to load reported items");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/lostfound/items/${id}`);

      setItems((prevItems) => prevItems.filter((item) => item._id !== id));
      setMsg("Item deleted successfully");
    } catch (err) {
      console.error("Delete item error:", err.response?.data || err.message);
      setMsg("Failed to delete item");
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item._id);

    setEditForm({
      itemName: item.itemName || "",
      category: item.category || "",
      color: item.color || "",
      location: item.location || "",
      description: item.description || "",
      status: item.status || "Pending",
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({
      itemName: "",
      category: "",
      color: "",
      location: "",
      description: "",
      status: "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/lostfound/items/${id}`,
        editForm
      );

      setItems((prevItems) =>
        prevItems.map((item) => (item._id === id ? res.data : item))
      );

      setEditingItem(null);
      setMsg("Item updated successfully");
    } catch (err) {
      console.error("Update item error:", err.response?.data || err.message);
      setMsg("Failed to update item");
    }
  };

  const getStatusPillClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
        return "admin-pill admin-pill--ok";
      case "rejected":
        return "admin-pill admin-pill--danger";
      case "pending":
      default:
        return "admin-pill admin-pill--warn";
    }
  };

  return (
    <AdminLayout
      title="Items (Manage)"
      subtitle="Edit and maintain reported lost & found items"
      actions={
        <button className="admin-btn admin-btn--primary" onClick={fetchItems}>
          Refresh
        </button>
      }
    >
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Lost & Found Management</h3>
          <div className="lf-meta">
            {msg ? <span className="lf-msg">{msg}</span> : null}
          </div>
        </div>

        <div className="admin-card-body">
          {loading ? <p className="lf-state">Loading items…</p> : null}

          {!loading && items.length === 0 ? (
            <p className="lf-state">No reported items found.</p>
          ) : null}

          {!loading && items.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Color</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ width: 220 }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr key={item._id}>
                      {editingItem === item._id ? (
                        <>
                          <td>
                            <input
                              className="lf-input"
                              type="text"
                              name="itemName"
                              value={editForm.itemName}
                              onChange={handleEditChange}
                            />
                          </td>

                          <td>
                            <input
                              className="lf-input"
                              type="text"
                              name="category"
                              value={editForm.category}
                              onChange={handleEditChange}
                            />
                          </td>

                          <td>
                            <input
                              className="lf-input"
                              type="text"
                              name="color"
                              value={editForm.color}
                              onChange={handleEditChange}
                            />
                          </td>

                          <td>
                            <input
                              className="lf-input"
                              type="text"
                              name="location"
                              value={editForm.location}
                              onChange={handleEditChange}
                            />
                          </td>

                          <td>
                            <input
                              className="lf-input"
                              type="text"
                              name="description"
                              value={editForm.description}
                              onChange={handleEditChange}
                            />
                          </td>

                          <td>
                            <select
                              className="lf-input"
                              name="status"
                              value={editForm.status}
                              onChange={handleEditChange}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>

                          <td>
                            <div className="lf-actions">
                              <button
                                className="admin-btn admin-btn--primary"
                                onClick={() => handleUpdate(item._id)}
                              >
                                Save
                              </button>
                              <button className="admin-btn" onClick={handleCancelEdit}>
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{item.itemName || "—"}</td>
                          <td>{item.category || "—"}</td>
                          <td>{item.color || "—"}</td>
                          <td>{item.location || "—"}</td>
                          <td className="lf-desc">{item.description || "—"}</td>
                          <td>
                            <span className={getStatusPillClass(item.status)}>
                              {item.status || "Pending"}
                            </span>
                          </td>

                          <td>
                            <div className="lf-actions">
                              <button className="admin-btn" onClick={() => handleEditClick(item)}>
                                Edit
                              </button>
                              <button
                                className="admin-btn admin-btn--danger"
                                onClick={() => handleDelete(item._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
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