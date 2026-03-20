import React, { useState } from "react";
import './FoundForm.css'

const FoundForm = () => {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    color: "",
    dateTime: "",
    location: "",
    description: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Found Item Submitted:", formData);
    alert("Found Item Submitted Successfully!");
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
          placeholder="Describe where and how you found it"
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