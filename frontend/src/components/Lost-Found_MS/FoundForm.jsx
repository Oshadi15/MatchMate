import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FoundForm.css";

const FoundForm = () => {

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

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  /* =========================
     DATE VALIDATION FUNCTION
  ========================= */
  const isFutureDate = (selectedDate) => {
    const now = new Date();
    const pickedDate = new Date(selectedDate);
    return pickedDate > now;
  };

  /* =========================
     SUBMIT TO BACKEND
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Prevent future dates
    if (isFutureDate(formData.dateTime)) {
      alert("Future dates are not allowed.");
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      const res = await axios.post(
        "http://localhost:5000/api/found",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(res.data.message || "Found item submitted successfully!");

      // ✅ Reset form
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
        dateTime: "",
        location: "",
        description: "",
        userEmail: savedEmail,
        image: null,
      });

      // reset file input manually
      document.querySelector('input[type="file"]').value = "";

    } catch (error) {
      console.error(error);
      alert("Error submitting found item");
    }
  };

  /* =========================
     GET CURRENT DATETIME
     (Prevents selecting future)
  ========================= */
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="form-container">
      <h2>Report Found Item</h2>

      <form onSubmit={handleSubmit}>

        <label>Item Name</label>
        <input
          type="text"
          name="itemName"
          placeholder="What did you find?"
          value={formData.itemName}
          onChange={handleChange}
          required
        />

        <label>Your email (same as your login — so you get Smart Match updates)</label>
        <input
          type="email"
          name="userEmail"
          placeholder="you@example.com"
          value={formData.userEmail}
          onChange={handleChange}
          required
        />

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

        <label>Date & Time</label>
        <input
          type="datetime-local"
          name="dateTime"
          value={formData.dateTime}
          max={getCurrentDateTime()}   // ✅ blocks future selection
          onChange={handleChange}
          required
        />

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

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Describe where and how you found it"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label>Upload Photo</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit">Submit Found Item</button>

      </form>
    </div>
  );
};

export default FoundForm;