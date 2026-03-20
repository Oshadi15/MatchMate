import React, { useState } from "react";
import axios from "axios";
import "./FoundForm.css";

const LostForm = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    color: "",
    dateTime: "",
    location: "",
    description: "",
    image: null,
  });

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

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

      console.log(response.data);
      alert("✅ Lost Item Submitted Successfully!");

    } catch (error) {
      console.error("Error submitting:", error);
      alert("❌ Failed to submit item");
    }
  };

  return (
    <div className="form-container">
      <h2>Report Lost Item</h2>

      <form onSubmit={handleSubmit}>
        <label>Item Name</label>
        <input
          type="text"
          name="itemName"
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <select name="category" onChange={handleChange} required>
          <option value="">Select Category</option>
          <option>Electronics</option>
          <option>Documents</option>
          <option>Accessories</option>
          <option>Clothes</option>
        </select>

        <label>Color</label>
        <select name="color" onChange={handleChange} required>
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
          onChange={handleChange}
          required
        />

        <label>Location</label>
        <select name="location" onChange={handleChange} required>
          <option value="">Select Location</option>
          <option>Library</option>
          <option>Cafeteria</option>
          <option>Classroom</option>
          <option>Parking Area</option>
        </select>

        <label>Description</label>
        <textarea
          name="description"
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

        <button type="submit">Submit Lost Item</button>
      </form>
    </div>
  );
};

export default LostForm;