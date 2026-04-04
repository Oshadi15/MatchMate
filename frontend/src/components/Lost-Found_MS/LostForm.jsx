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

  const [dateError, setDateError] = useState("");

  /* ================= GET CURRENT DATETIME ================= */
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  /* ================= AUTO SET CURRENT TIME ================= */
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

    // ✅ Future date validation
    if (name === "dateTime") {
      const selectedDate = new Date(value);
      const currentDate = new Date();

      if (selectedDate > currentDate) {
        setDateError("❌ Future date & time not allowed");
      } else {
        setDateError("");
      }
    }

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedDate = new Date(formData.dateTime);
    const currentDate = new Date();

    // ✅ Final safety validation
    if (selectedDate > currentDate) {
      alert("❌ You cannot select a future date or time.");
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const response = await axios.post(
        "http://localhost:5000/api/lost",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Lost Item Submitted Successfully!");

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

    } catch (error) {
      console.error("Error submitting:", error);
      alert("❌ Failed to submit item");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="form-container">
      <h2>Report Lost Item</h2>

      <form onSubmit={handleSubmit}>
        {/* Item Name */}
        <label>Item Name</label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          required
        />

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
          required
        >
          <option value="">Select Category</option>
          <option>Electronics</option>
          <option>Documents</option>
          <option>Accessories</option>
          <option>Clothes</option>
        </select>

        {/* Color */}
        <label>Color</label>
        <select
          name="color"
          value={formData.color}
          onChange={handleChange}
          required
        >
          <option value="">Select Color</option>
          <option>Black</option>
          <option>Blue</option>
          <option>Red</option>
          <option>White</option>
        </select>

        {/* Date & Time */}
        <label>Date & Time</label>
        <input
          type="datetime-local"
          name="dateTime"
          value={formData.dateTime}
          max={getCurrentDateTime()}   /* ✅ blocks future dates */
          onChange={handleChange}
          required
          className={dateError ? "input-error" : ""}
        />

        {dateError && <p className="error-text">{dateError}</p>}

        {/* Location */}
        <label>Location</label>
        <select
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        >
          <option value="">Select Location</option>
          <option>Library</option>
          <option>Cafeteria</option>
          <option>Classroom</option>
          <option>Parking Area</option>
        </select>

        {/* Description */}
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        {/* Image */}
        <label>Upload Photo</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        {/* Submit */}
        <button type="submit" disabled={dateError}>
          Submit Lost Item
        </button>
      </form>
    </div>
  );
};

export default LostForm;