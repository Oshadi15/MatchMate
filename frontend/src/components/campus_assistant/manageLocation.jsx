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

const initialErrors = {
  name: "",
  building: "",
  floor: "",
  roomNumber: "",
  nearbyLandmark: "",
  description: "",
  googleMapsLink: "",
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
  const [errors, setErrors] = useState(initialErrors);
  const [locations, setLocations] = useState(initialLocations);
  const [editingId, setEditingId] = useState(null);

  const textOnlyFields = ["name", "building", "nearbyLandmark"];

  const validateField = (name, value) => {
    const trimmedValue = value.trim();

    switch (name) {
      case "name":
        if (!trimmedValue) return "Location name is required";
        if (trimmedValue.length < 3) {
          return "Location name must be at least 3 characters";
        }
        if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
          return "Location name can only contain letters and spaces";
        }
        return "";

      case "building":
        if (!trimmedValue) return "Building is required";
        if (trimmedValue.length < 2) {
          return "Building must be at least 2 characters";
        }
        if (!/^[A-Za-z\s]+$/.test(trimmedValue)) {
          return "Building can only contain letters and spaces";
        }
        return "";

      case "floor":
        if (!trimmedValue) return "Floor is required";
        if (!/^[A-Za-z0-9\s-]+$/.test(trimmedValue)) {
          return "Floor can only contain letters, numbers, spaces and hyphens";
        }
        return "";

      case "roomNumber":
        if (trimmedValue && !/^[A-Za-z0-9-]+$/.test(trimmedValue)) {
          return "Room number can only contain letters, numbers and hyphens";
        }
        return "";

      case "nearbyLandmark":
        if (trimmedValue && trimmedValue.length < 3) {
          return "Nearby landmark must be at least 3 characters";
        }
        if (trimmedValue && !/^[A-Za-z\s]+$/.test(trimmedValue)) {
          return "Nearby landmark can only contain letters and spaces";
        }
        return "";

      case "description":
        if (!trimmedValue) return "Description is required";
        if (trimmedValue.length < 10) {
          return "Description must be at least 10 characters";
        }
        return "";

      case "googleMapsLink":
        if (!trimmedValue) return "Google Maps link is required";
        if (
          !/^https?:\/\/(www\.)?(google\.com\/maps|www\.google\.com\/maps\/search|goo\.gl\/maps|maps\.app\.goo\.gl)/i.test(
            trimmedValue
          )
        ) {
          return "Enter a valid Google Maps link";
        }
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(initialErrors).forEach((key) => {
      newErrors[key] = validateField(key, formData[key] || "");
    });

    const duplicateLocation = locations.find((location) => {
      const sameName =
        location.name.trim().toLowerCase() === formData.name.trim().toLowerCase();
      const differentId = location._id !== editingId;
      return sameName && differentId;
    });

    if (duplicateLocation) {
      newErrors.name = "This location name already exists";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (textOnlyFields.includes(name)) {
      updatedValue = value.replace(/[^A-Za-z\s]/g, "");
    }

    if (name === "roomNumber") {
      updatedValue = value.replace(/[^A-Za-z0-9-]/g, "");
    }

    if (name === "floor") {
      updatedValue = value.replace(/[^A-Za-z0-9\s-]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (Object.prototype.hasOwnProperty.call(initialErrors, name)) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, updatedValue),
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setErrors(initialErrors);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const cleanedData = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      building: formData.building.trim(),
      floor: formData.floor.trim(),
      roomNumber: formData.roomNumber.trim(),
      nearbyLandmark: formData.nearbyLandmark.trim(),
      description: formData.description.trim(),
      googleMapsLink: formData.googleMapsLink.trim(),
      status: formData.status.trim(),
    };

    if (editingId) {
      const updatedLocations = locations.map((location) =>
        location._id === editingId ? { ...location, ...cleanedData } : location
      );
      setLocations(updatedLocations);
      alert("Location updated successfully");
    } else {
      const newLocation = {
        _id: Date.now().toString(),
        ...cleanedData,
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

    setErrors(initialErrors);
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
            <div className="field-group">
              <label>Location Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter location name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="field-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
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
            </div>

            <div className="field-group">
              <label>Building</label>
              <input
                type="text"
                name="building"
                placeholder="Enter building name"
                value={formData.building}
                onChange={handleChange}
              />
              {errors.building && <p className="field-error">{errors.building}</p>}
            </div>

            <div className="field-group">
              <label>Floor</label>
              <input
                type="text"
                name="floor"
                placeholder="Enter floor"
                value={formData.floor}
                onChange={handleChange}
              />
              {errors.floor && <p className="field-error">{errors.floor}</p>}
            </div>

            <div className="field-group">
              <label>Room Number</label>
              <input
                type="text"
                name="roomNumber"
                placeholder="Enter room number"
                value={formData.roomNumber}
                onChange={handleChange}
              />
              {errors.roomNumber && (
                <p className="field-error">{errors.roomNumber}</p>
              )}
            </div>

            <div className="field-group">
              <label>Nearby Landmark</label>
              <input
                type="text"
                name="nearbyLandmark"
                placeholder="Enter nearby landmark"
                value={formData.nearbyLandmark}
                onChange={handleChange}
              />
              {errors.nearbyLandmark && (
                <p className="field-error">{errors.nearbyLandmark}</p>
              )}
            </div>

            <div className="field-group">
              <label>Google Maps Link</label>
              <input
                type="text"
                name="googleMapsLink"
                placeholder="Paste Google Maps link"
                value={formData.googleMapsLink}
                onChange={handleChange}
              />
              {errors.googleMapsLink && (
                <p className="field-error">{errors.googleMapsLink}</p>
              )}
            </div>

            <div className="field-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Temporarily Closed">Temporarily Closed</option>
              </select>
            </div>
          </div>

          <div className="field-group full-width-field">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Enter location description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <p className="field-error">{errors.description}</p>
            )}
          </div>

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