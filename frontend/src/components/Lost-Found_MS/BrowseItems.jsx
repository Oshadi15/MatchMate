import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BrowseItems.css";

const BrowserItems = () => {
  const [foundItems, setFoundItems] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  /* ================= CLAIM FUNCTION ================= */
  // ✅ NEW
  const handleClaim = (item) => {
    alert(`Claim request sent for: ${item.itemName}`);
    
    // Later you can connect backend here
    // axios.post("http://localhost:5000/api/claim", { itemId: item._id })
  };

  const getArrayFromResponse = (data, possibleKeys = []) => {
    if (Array.isArray(data)) return data;

    for (let key of possibleKeys) {
      if (Array.isArray(data?.[key])) return data[key];
    }

    return [];
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      const [foundRes, lostRes] = await Promise.all([
        axios.get("http://localhost:5000/api/found"),
        axios.get("http://localhost:5000/api/lost"),
      ]);

      const foundArray = getArrayFromResponse(foundRes.data, [
        "foundItems",
        "items",
        "data",
      ]);

      const lostArray = getArrayFromResponse(lostRes.data, [
        "lostItems",
        "items",
        "data",
      ]);

      setFoundItems(foundArray);
      setLostItems(lostArray);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to load items");
      setFoundItems([]);
      setLostItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "No date available";

    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString();
  };

  const matchesSearch = (item) => {
    const itemName = (item.itemName || "").toLowerCase();
    const searchText = searchName.toLowerCase().trim();

    const nameMatch = searchText === "" || itemName.includes(searchText);

    let dateMatch = true;
    if (searchDate) {
      const itemDate = new Date(item.dateTime);
      const selectedDate = new Date(searchDate);

      dateMatch =
        itemDate.getFullYear() === selectedDate.getFullYear() &&
        itemDate.getMonth() === selectedDate.getMonth() &&
        itemDate.getDate() === selectedDate.getDate();
    }

    return nameMatch && dateMatch;
  };

  const filteredFoundItems = Array.isArray(foundItems)
    ? foundItems.filter(matchesSearch)
    : [];

  const filteredLostItems = Array.isArray(lostItems)
    ? lostItems.filter(matchesSearch)
    : [];

  const renderItemCards = (items, emptyMessage) => {
    if (items.length === 0) {
      return <p className="empty-text">{emptyMessage}</p>;
    }

    return (
      <div className="items-grid">
        {items.map((item) => (
          <div className="item-card" key={item._id}>
            <div className="item-card-image-wrapper">
              {item.image ? (
                <img
                  src={`http://localhost:5000/uploads/${item.image}`}
                  alt={item.itemName}
                  className="item-card-image"
                />
              ) : (
                <div className="no-image-box">No image</div>
              )}
            </div>

            <div className="item-card-content">
              <h3 className="item-card-title">
                {item.itemName || "Unnamed Item"}
              </h3>

              <div className="item-card-details">
                <p><span>Category:</span> {item.category || "N/A"}</p>
                <p><span>Color:</span> {item.color || "N/A"}</p>
                <p><span>Date & Time:</span> {formatDateTime(item.dateTime)}</p>
                <p><span>Location:</span> {item.location || "N/A"}</p>
                <p><span>Description:</span> {item.description || "No description"}</p>
              </div>

              {/* ✅ CLAIM BUTTON ADDED */}
              <button
                className="claim-btn"
                onClick={() => handleClaim(item)}
              >
                Claim
              </button>

            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="browse-items-page">
        <p className="loading-text">Loading items...</p>
      </div>
    );
  }

  return (
    <div className="browse-items-page">
      <div className="browse-items-container">
        <h1 className="browse-title">Browse Lost & Found Items</h1>

        <div className="search-bar-card">
          <div className="search-controls">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="search-date"
            />

            <input
              type="text"
              placeholder="Search by item name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="search-name"
            />

            <button className="search-btn" onClick={fetchItems}>
              Refresh
            </button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="items-sections">
          <div className="items-card">
            <h2 className="section-title lost-title">Recent Lost Items</h2>
            {renderItemCards(filteredLostItems, "No lost items found.")}
          </div>

          <div className="items-card">
            <h2 className="section-title found-title">Recent Found Items</h2>
            {renderItemCards(filteredFoundItems, "No found items found.")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserItems;