import React, { useEffect, useState } from "react";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../services/locationApi";
import "./manageLocation.css";

const initialForm = {
  name: "",
  category: "Lecture Hall",
  building: "",
  floor: "",
  roomNumber: "",
  description: "",
  nearbyLandmark: "",
  googleMapsLink: "",
  image: "",
  status: "Available",
};

export default function ManageLocations() {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error("Failed to fetch locations", error);
      alert("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateLocation(editingId, formData);
        alert("Location updated successfully");
      } else {
        await createLocation(formData);
        alert("Location created successfully");
      }

      resetForm();
      loadLocations();
    } catch (error) {
      console.error("Failed to save location", error);
      alert(error?.response?.data?.message || "Failed to save location");
    }
  };

  const handleEdit = (location) => {
    setFormData({
      name: location.name || "",
      category: location.category || "Lecture Hall",
      building: location.building || "",
      floor: location.floor || "",
      roomNumber: location.roomNumber || "",
      description: location.description || "",
      nearbyLandmark: location.nearbyLandmark || "",
      googleMapsLink: location.googleMapsLink || "",
      image: location.image || "",
      status: location.status || "Available",
    });
    setEditingId(location._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this location?");
    if (!ok) return;

    try {
      await deleteLocation(id);
      alert("Location deleted successfully");
      loadLocations();
    } catch (error) {
      console.error("Failed to delete location", error);
      alert("Failed to delete location");
    }
  };

  return (
    <div className="location-admin-page">
      <div className="location-admin-container">
        <h1>Manage Campus Locations</h1>
        <p className="subtitle">
          Add, edit, and delete official campus locations for students.
        </p>

        <form className="location-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input
              type="text"
              name="name"
              placeholder="Location Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
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

            <input
              type="text"
              name="building"
              placeholder="Building"
              value={formData.building}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="floor"
              placeholder="Floor"
              value={formData.floor}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="roomNumber"
              placeholder="Room Number"
              value={formData.roomNumber}
              onChange={handleChange}
            />

            <input
              type="text"
              name="nearbyLandmark"
              placeholder="Nearby Landmark"
              value={formData.nearbyLandmark}
              onChange={handleChange}
            />

            <input
              type="url"
              name="googleMapsLink"
              placeholder="Google Maps Link"
              value={formData.googleMapsLink}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="image"
              placeholder="Image URL (optional)"
              value={formData.image}
              onChange={handleChange}
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="Temporarily Closed">Temporarily Closed</option>
            </select>
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />

          <div className="form-actions">
            <button type="submit" className="save-btn">
              {editingId ? "Update Location" : "Add Location"}
            </button>

            <button type="button" className="cancel-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        <div className="location-list">
          <h2>All Locations</h2>

          {loading ? (
            <p>Loading locations...</p>
          ) : locations.length === 0 ? (
            <p>No locations found.</p>
          ) : (
            <div className="location-cards">
              {locations.map((location) => (
                <div className="location-card" key={location._id}>
                  {location.image ? (
                    <img
                      src={location.image}
                      alt={location.name}
                      className="location-image"
                    />
                  ) : (
                    <div className="image-placeholder">No Image</div>
                  )}

                  <h3>{location.name}</h3>
                  <p><strong>Category:</strong> {location.category}</p>
                  <p><strong>Building:</strong> {location.building}</p>
                  <p><strong>Floor:</strong> {location.floor}</p>
                  <p><strong>Status:</strong> {location.status}</p>

                  <div className="card-actions">
                    <button onClick={() => handleEdit(location)} className="edit-btn">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(location._id)} className="delete-btn">
                      Delete
                    </button>
                    <a
                      href={location.googleMapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="map-btn"
                    >
                      Open Map
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}