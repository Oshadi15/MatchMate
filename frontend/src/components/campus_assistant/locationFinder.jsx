import React, { useEffect, useState, useCallback } from "react";
import { getLocations } from "../../services/locationApi";
import "./locationFinder.css";

export default function LocationFinder() {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;

      const data = await getLocations(params);
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch locations", err);
      setError(err?.response?.data?.message || "Failed to fetch locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadLocations();
  };

  return (
    <div className="location-finder-page">
      <div className="location-finder-container">
        <h1>Campus Location Finder</h1>
        <p className="finder-subtitle">
          Search official campus places and open them in Google Maps.
        </p>

        <form className="finder-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by location name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Lecture Hall">Lecture Hall</option>
            <option value="Lab">Lab</option>
            <option value="Library">Library</option>
            <option value="Office">Office</option>
            <option value="Cafeteria">Cafeteria</option>
            <option value="Parking">Parking</option>
            <option value="Medical">Medical</option>
            <option value="Sports">Sports</option>
            <option value="Washroom">Washroom</option>
            <option value="Other">Other</option>
          </select>

          <button type="submit">Search</button>
        </form>

        {loading ? (
          <p className="finder-message success">Loading locations...</p>
        ) : error ? (
          <p className="finder-message error">{error}</p>
        ) : locations.length === 0 ? (
          <p className="finder-message success">No matching locations found.</p>
        ) : (
          <div className="finder-grid">
            {locations.map((location) => (
              <div className="finder-card" key={location._id}>
                {location.image ? (
                  <img src={location.image} alt={location.name} />
                ) : (
                  <div className="finder-image-placeholder">No Image</div>
                )}

                <h3>{location.name}</h3>
                <p><strong>Category:</strong> {location.category}</p>
                <p><strong>Building:</strong> {location.building}</p>
                <p><strong>Floor:</strong> {location.floor}</p>

                {location.roomNumber && (
                  <p><strong>Room:</strong> {location.roomNumber}</p>
                )}

                {location.nearbyLandmark && (
                  <p><strong>Nearby:</strong> {location.nearbyLandmark}</p>
                )}

                {location.description && (
                  <p><strong>Description:</strong> {location.description}</p>
                )}

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      location.status === "Available"
                        ? "status-available"
                        : "status-closed"
                    }
                  >
                    {location.status}
                  </span>
                </p>

                <a
                  href={location.googleMapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="finder-map-btn"
                >
                  Open in Google Maps
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}