import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./AdminBrowse.css";
import AdminLayout from "../AdminDashBoard/AdminLayout";

const getArrayFromResponse = (data, keys = []) => {
  if (Array.isArray(data)) return data;
  for (let key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
};

const AdminBrowse = () => {
  const [foundItems, setFoundItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  /* ================= FETCH ITEMS ================= */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);

      const [foundRes, lostRes] = await Promise.all([
        axios.get("http://localhost:5000/api/found"),
        axios.get("http://localhost:5000/api/lost"),
      ]);

      setFoundItems(
        getArrayFromResponse(foundRes.data, ["foundItems", "items", "data"])
      );

      setLostItems(
        getArrayFromResponse(lostRes.data, ["lostItems", "items", "data"])
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ================= DELETE ITEM ================= */
  const deleteItem = async (id, type) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/${type}/${id}`);

      alert("Item deleted successfully ✅");

      fetchItems(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };

  /* ================= FORMAT DATE ================= */
  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return new Date(dateTime).toLocaleString();
  };

  /* ================= SEARCH FILTER ================= */
  const matchesSearch = (item) => {
    const nameMatch =
      !searchName ||
      item.itemName?.toLowerCase().includes(searchName.toLowerCase());

    let dateMatch = true;

    if (searchDate) {
      const itemDate = new Date(item.dateTime);
      const selected = new Date(searchDate);

      dateMatch =
        itemDate.getFullYear() === selected.getFullYear() &&
        itemDate.getMonth() === selected.getMonth() &&
        itemDate.getDate() === selected.getDate();
    }

    return nameMatch && dateMatch;
  };

  const filteredLost = lostItems.filter(matchesSearch);
  const filteredFound = foundItems.filter(matchesSearch);

  /* ================= TABLE RENDER ================= */
  const renderTable = (items, type, emptyMsg) => {
    if (!items.length) return <p className="empty-text">{emptyMsg}</p>;

    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Color</th>
              <th>Date</th>
              <th>Location</th>
              <th>Description</th>
              <th style={{ width: 120 }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>
                  {item.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${item.image}`}
                      alt="item"
                      className="table-img"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>

                <td>{item.itemName || "N/A"}</td>
                <td>{item.category || "N/A"}</td>
                <td>{item.color || "N/A"}</td>
                <td>{formatDateTime(item.dateTime)}</td>
                <td>{item.location || "N/A"}</td>
                <td>{item.description || "—"}</td>

                <td>
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={() => deleteItem(item._id, type)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <AdminLayout
      title="Items (Browse)"
      subtitle="Review lost and found reports and keep the list clean"
      actions={
        <button className="admin-btn admin-btn--primary" onClick={fetchItems}>
          Refresh
        </button>
      }
    >
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Search</h3>
        </div>
        <div className="admin-card-body">
          <div className="ab-filters">
            <input
              className="ab-input"
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />

            <input
              className="ab-input"
              type="text"
              placeholder="Search by item name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />

            <button className="admin-btn" onClick={() => { setSearchName(""); setSearchDate(""); }}>
              Clear
            </button>
          </div>

          {error ? <p className="ab-error">{error}</p> : null}
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading items…</p>
      ) : (
        <>
          <div className="ab-section">
            <div className="ab-section-head">
              <h3 className="ab-section-title">Lost Items</h3>
              <span className="ab-section-meta">{filteredLost.length} items</span>
            </div>
            <div className="ab-table">{renderTable(filteredLost, "lost", "No lost items found.")}</div>
          </div>

          <div className="ab-section">
            <div className="ab-section-head">
              <h3 className="ab-section-title">Found Items</h3>
              <span className="ab-section-meta">{filteredFound.length} items</span>
            </div>
            <div className="ab-table">{renderTable(filteredFound, "found", "No found items found.")}</div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminBrowse;