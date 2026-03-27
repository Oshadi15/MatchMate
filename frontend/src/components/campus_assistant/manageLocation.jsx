import React, { useState } from "react";
import "./manageLocation.css";

const initialForm = {
  name: "",
  category: "Lecture Hall",
  building: "",
  floor: "",
  roomNumber: "",
  nearbyLandmark: "",
  description: "",
  googleMapsLink: "",
  status: "Available",
};

const initialLocations = [
  {
    _id: "1",
    name: "SLIIT Car Park",
    category: "Parking",
    building: "Near New Building",
    floor: "Ground Floor",
    roomNumber: "",
    nearbyLandmark: "Next to New Building",
    description: "Main student parking area inside the campus.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+Car+Park",
    status: "Available",
  },
  {
    _id: "2",
    name: "Main Library",
    category: "Library",
    building: "Block A",
    floor: "2",
    roomNumber: "A-201",
    nearbyLandmark: "Opposite New Building",
    description: "Library for study and learning resources.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+Library",
    status: "Available",
  },
  {
    _id: "3",
    name: "Engineering Lab",
    category: "Lab",
    building: "Engineering Block",
    floor: "3",
    roomNumber: "E-305",
    nearbyLandmark: "Near Main Library",
    description: "Laboratory facility for engineering practical sessions.",
    googleMapsLink: "https://www.google.com/maps/search/SLIIT+Engineering+Lab",
    status: "Temporarily Closed",
  },
];

export default function ManageLocation() {
  const [formData, setFormData] = useState(initialForm);
  const [locations, setLocations] = useState(initialLocations);
  const [editingId, setEditingId] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      const updatedLocations = locations.map((location) =>
        location._id === editingId ? { ...location, ...formData } : location
      );
      setLocations(updatedLocations);
      alert("Location updated successfully");
    } else {
      const newLocation = {
        _id: Date.now().toString(),
        ...formData,
      };
      setLocations([newLocation, ...locations]);
      alert("Location added successfully");
    }

    resetForm();
  };

  const handleEdit = (location) => {
    setFormData({
      name: location.name || "",
      category: location.category || "Lecture Hall",
      building: location.building || "",
      floor: location.floor || "",
      roomNumber: location.roomNumber || "",
      nearbyLandmark: location.nearbyLandmark || "",
      description: location.description || "",
      googleMapsLink: location.googleMapsLink || "",
      status: location.status || "Available",
    });

    setEditingId(location._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this location?");
    if (!confirmed) return;

    const updatedLocations = locations.filter((location) => location._id !== id);
    setLocations(updatedLocations);
    alert("Location deleted successfully");
  };

  return (
    <div className="manage-location-page">
      <div className="manage-location-container">
        <h1>Manage Campus Locations</h1>
        <p className="manage-subtitle">
          Add, edit, and remove official campus locations for students.
        </p>

        <form className="manage-location-form" onSubmit={handleSubmit}>
          <div className="manage-form-grid">
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
            rows="4"
            value={formData.description}
            onChange={handleChange}
          />

          <div className="manage-form-actions">
            <button type="submit" className="save-btn">
              {editingId ? "Update Location" : "Add Location"}
            </button>

            <button type="button" className="clear-btn" onClick={resetForm}>
              Clear
            </button>
          </div>
        </form>

        <div className="manage-location-list">
          <h2>Saved Locations</h2>

          {locations.length === 0 ? (
            <p className="empty-text">No locations available.</p>
          ) : (
            <div className="manage-location-grid">
              {locations.map((location) => (
                <div className="manage-location-card" key={location._id}>
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

                  <div className="manage-card-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(location)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(location._id)}
                    >
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