import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./BrowseItems.css";

export default function BrowseItems() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      // change these URLs according to your backend routes
      const [lostRes, foundRes] = await Promise.all([
        axios.get("http://localhost:5000/api/lost-items"),
        axios.get("http://localhost:5000/api/found-items"),
      ]);

      setLostItems(Array.isArray(lostRes.data) ? lostRes.data : []);
      setFoundItems(Array.isArray(foundRes.data) ? foundRes.data : []);
    } catch (err) {
      setError("Failed to load items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "No date";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isSameDate = (itemDate, selectedDate) => {
    if (!itemDate || !selectedDate) return true;

    const d1 = new Date(itemDate);
    const d2 = new Date(selectedDate);

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const matchesName = (itemName, typedName) => {
    if (!typedName.trim()) return true;
    return (itemName || "").toLowerCase().includes(typedName.toLowerCase());
  };

  const filteredLostItems = useMemo(() => {
    return lostItems
      .filter(
        (item) =>
          matchesName(item.itemName || item.name, searchName) &&
          isSameDate(item.dateLost || item.createdAt || item.date, searchDate)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.dateLost || b.date) -
          new Date(a.createdAt || a.dateLost || a.date)
      );
  }, [lostItems, searchName, searchDate]);

  const filteredFoundItems = useMemo(() => {
    return foundItems
      .filter(
        (item) =>
          matchesName(item.itemName || item.name, searchName) &&
          isSameDate(item.dateFound || item.createdAt || item.date, searchDate)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.dateFound || b.date) -
          new Date(a.createdAt || a.dateFound || a.date)
      );
  }, [foundItems, searchName, searchDate]);

  return (
    <div className="browse-items-page">
      <div className="browse-items-container">
        <h1 className="browse-title">Search Lost & Found Items</h1>

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
              placeholder="Enter item name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="search-name"
            />

            <button
              className="search-btn"
              onClick={fetchItems}
              type="button"
            >
              Search
            </button>
          </div>
        </div>

        {loading && <p className="status-msg">Loading items...</p>}
        {error && <p className="error-msg">{error}</p>}

        {!loading && !error && (
          <div className="items-sections">
            <div className="items-card">
              <h2 className="section-title lost-title">Recent Lost Items</h2>
              <p className="section-subtitle">Items recently reported missing.</p>

              <div className="items-list">
                {filteredLostItems.length > 0 ? (
                  filteredLostItems.slice(0, 8).map((item) => (
                    <div className="item-row" key={item._id}>
                      <div className="item-image-box">
                        <img
                          src={
                            item.image ||
                            "https://via.placeholder.com/80?text=Lost"
                          }
                          alt={item.itemName || item.name}
                          className="item-image"
                        />
                      </div>

                      <div className="item-details">
                        <h3>{item.itemName || item.name}</h3>
                        <p>
                          Lost on{" "}
                          {formatDate(
                            item.dateLost || item.createdAt || item.date
                          )}
                        </p>
                        {item.location && (
                          <span className="item-location">
                            Location: {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-msg">No lost items found.</p>
                )}
              </div>
            </div>

            <div className="items-card">
              <h2 className="section-title found-title">Recent Found Items</h2>
              <p className="section-subtitle">Items recently submitted as found.</p>

              <div className="items-list">
                {filteredFoundItems.length > 0 ? (
                  filteredFoundItems.slice(0, 8).map((item) => (
                    <div className="item-row" key={item._id}>
                      <div className="item-image-box">
                        <img
                          src={
                            item.image ||
                            "https://via.placeholder.com/80?text=Found"
                          }
                          alt={item.itemName || item.name}
                          className="item-image"
                        />
                      </div>

                      <div className="item-details">
                        <h3>{item.itemName || item.name}</h3>
                        <p>
                          Found on{" "}
                          {formatDate(
                            item.dateFound || item.createdAt || item.date
                          )}
                        </p>
                        {item.location && (
                          <span className="item-location">
                            Location: {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-msg">No found items found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}