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

      console.log("Found response:", foundRes.data);
      console.log("Lost response:", lostRes.data);

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

  if (loading) return <p className="loading-text">Loading items...</p>;

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

            {filteredLostItems.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Color</th>
                      <th>Date & Time</th>
                      <th>Location</th>
                      <th>Description</th>
                      <th>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLostItems.map((item) => (
                      <tr key={item._id}>
                        <td>{item.itemName}</td>
                        <td>{item.category}</td>
                        <td>{item.color}</td>
                        <td>{formatDateTime(item.dateTime)}</td>
                        <td>{item.location}</td>
                        <td>{item.description}</td>
                        <td>
                          {item.image ? (
                            <img
                              src={`http://localhost:5000/uploads/${item.image}`}
                              alt={item.itemName}
                              width="80"
                              className="table-image"
                            />
                          ) : (
                            "No image"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-text">No lost items found.</p>
            )}
          </div>

          <div className="items-card">
            <h2 className="section-title found-title">Recent Found Items</h2>

            {filteredFoundItems.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Color</th>
                      <th>Date & Time</th>
                      <th>Location</th>
                      <th>Description</th>
                      <th>Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFoundItems.map((item) => (
                      <tr key={item._id}>
                        <td>{item.itemName}</td>
                        <td>{item.category}</td>
                        <td>{item.color}</td>
                        <td>{formatDateTime(item.dateTime)}</td>
                        <td>{item.location}</td>
                        <td>{item.description}</td>
                        <td>
                          {item.image ? (
                            <img
                              src={`http://localhost:5000/uploads/${item.image}`}
                              alt={item.itemName}
                              width="80"
                              className="table-image"
                            />
                          ) : (
                            "No image"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-text">No found items found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserItems;