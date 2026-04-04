import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FoundForm.css";

const LostForm = () => {

  /* ================= STATE ================= */
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    color: "",
    dateTime: "",
    location: "",
    description: "",
    userEmail: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [dateError, setDateError] = useState("");

  /* ================= GET CURRENT DATETIME ================= */
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  /* ================= AUTO SET TIME ================= */
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      dateTime: getCurrentDateTime(),
    }));
  }, []);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u.email) {
        setFormData((prev) => ({ ...prev, userEmail: u.email }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // future date validation
    if (name === "dateTime") {
      const selectedDate = new Date(value);
      const currentDate = new Date();

      if (selectedDate > currentDate) {
        setDateError("Future date & time not allowed");
      } else {
        setDateError("");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    // remove error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    let newErrors = {};

    // Item name validation
    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.itemName)) {
      newErrors.itemName =
        "Item name cannot contain numbers or symbols";
    }

    if (!formData.category)
      newErrors.category = "Category is required";

    if (!formData.color)
      newErrors.color = "Color is required";

    if (!formData.location)
      newErrors.location = "Location is required";

    if (!formData.dateTime)
      newErrors.dateTime = "Date & time is required";

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else {
      const wordCount =
        formData.description.trim().split(/\s+/).length;

      if (wordCount > 100) {
        newErrors.description =
          "Description cannot exceed 100 words";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const selectedDate = new Date(formData.dateTime);
    const currentDate = new Date();

    if (selectedDate > currentDate) {
      setDateError("Future date & time not allowed");
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      await axios.post(
        "http://localhost:5000/api/lost",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Lost Item Submitted Successfully!");

      // reset form
      // Reset form
      const savedEmail = (() => {
        try {
          const u = JSON.parse(localStorage.getItem("user") || "{}");
          return u.email || "";
        } catch {
          return "";
        }
      })();
      setFormData({
        itemName: "",
        category: "",
        color: "",
        dateTime: getCurrentDateTime(),
        location: "",
        description: "",
        userEmail: savedEmail,
        image: null,
      });

      setErrors({});
      setDateError("");

    } catch (error) {
      console.error(error);
      alert("Failed to submit item");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="mm-form-page">
      <div className="form-container">
        <h2>Report Lost Item</h2>

      <form onSubmit={handleSubmit}>

        <form onSubmit={handleSubmit} className="mm-form">
        {/* Item Name */}
        <label>Item Name</label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
        />
        {errors.itemName && (
          <p className="error">{errors.itemName}</p>
        )}

        <label>Contact email (for match notifications)</label>
        <input
          type="email"
          name="userEmail"
          placeholder="your.email@example.com"
          value={formData.userEmail}
          onChange={handleChange}
          required
        />

        {/* Category */}
        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          <option>Electronics</option>
          <option>Documents</option>
          <option>Accessories</option>
          <option>Clothes</option>
          <option>Other</option>
        </select>
        {errors.category && <p className="error">{errors.category}</p>}

        {/* Color */}
        <label>Color</label>
        <select
          name="color"
          value={formData.color}
          onChange={handleChange}
        >
          <option value="">Select Color</option>
          <option>Black</option>
          <option>Blue</option>
          <option>Red</option>
          <option>White</option>
          <option>Other</option>
        </select>
        {errors.color && <p className="error">{errors.color}</p>}

        {/* Date */}
        <label>Date & Time</label>
        <input
          type="datetime-local"
          name="dateTime"
          value={formData.dateTime}
          max={getCurrentDateTime()}
          onChange={handleChange}
          className={dateError ? "input-error" : ""}
        />
        {dateError && <p className="error">{dateError}</p>}
        {errors.dateTime && <p className="error">{errors.dateTime}</p>}

        {/* Location */}
        <label>Location</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
        >
          <option value="">Select Location</option>
          <option>Library</option>
          <option>Cafeteria</option>
          <option>Classroom</option>
          <option>Parking Area</option>
          <option>Other</option>
        </select>
        {errors.location && <p className="error">{errors.location}</p>}

        {/* Description */}
        <label>Description (Max 100 words)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && (
          <p className="error">{errors.description}</p>
        )}

        {/* Image */}
        <label>Upload Photo</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit" disabled={dateError}>
          Submit Lost Item
        </button>

      </form>
        {/* Submit */}
          <button type="submit" disabled={dateError}>
            Submit Lost Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default LostForm;