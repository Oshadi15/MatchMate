import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FoundForm.css";

/* =========================
   LOCAL DATETIME
========================= */
const getLocalDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const FoundForm = () => {

  /* =========================
     STATE
  ========================= */
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    color: "",
    dateTime: getLocalDateTime(),
    location: "",
    description: "",
    userEmail: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [fileKey, setFileKey] = useState(Date.now());
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
     HANDLE CHANGE
  ========================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

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

  /* =========================
     VALIDATION FUNCTION
  ========================= */
  const validateForm = () => {
    let newErrors = {};

    // ✅ Item name required
    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item name is required";
    }
    // ✅ Letters only validation
    else if (!/^[A-Za-z\s]+$/.test(formData.itemName)) {
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

    // ✅ Description validation
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

  /* =========================
     FUTURE DATE CHECK
  ========================= */
  const isFutureDate = (selectedDate) => {
    return new Date(selectedDate) > new Date();
  };

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // run validations
    if (!validateForm()) return;

    if (isFutureDate(formData.dateTime)) {
      setErrors({ dateTime: "Future dates are not allowed" });
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

      alert(res.data.message || "Found item submitted!");

      // reset
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
        dateTime: getLocalDateTime(),
        location: "",
        description: "",
        userEmail: savedEmail,
        image: null,
      });

      setErrors({});
      setFileKey(Date.now());

    } catch (error) {
      console.error(error);
      alert("Error submitting item");
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="mm-form-page">
      <div className="form-container">
        <h2>Report Found Item</h2>

        <form onSubmit={handleSubmit} className="mm-form">

        {/* ITEM NAME */}
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

        {/* CATEGORY */}
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
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="">Select Category</option>
          <option>Electronics</option>
          <option>Documents</option>
          <option>Accessories</option>
          <option>Clothes</option>
          <option>Other</option>
        </select>
        {errors.category && <p className="error">{errors.category}</p>}

        {/* COLOR */}
        <label>Color</label>
        <select name="color" value={formData.color} onChange={handleChange}>
          <option value="">Select Color</option>
          <option>Black</option>
          <option>Blue</option>
          <option>Red</option>
          <option>White</option>
          <option>Other</option>
        </select>
        {errors.color && <p className="error">{errors.color}</p>}

        {/* DATE */}
        <label>Date & Time</label>
        <input
          type="datetime-local"
          name="dateTime"
          value={formData.dateTime}
          max={getLocalDateTime()}
          onChange={handleChange}
        />
        {errors.dateTime && <p className="error">{errors.dateTime}</p>}

        {/* LOCATION */}
        <label>Location</label>
        <select name="location" value={formData.location} onChange={handleChange}>
          <option value="">Select Location</option>
          <option>Library</option>
          <option>Cafeteria</option>
          <option>Classroom</option>
          <option>Parking Area</option>
          <option>Other</option>
        </select>
        {errors.location && <p className="error">{errors.location}</p>}

        {/* DESCRIPTION */}
        <label>Description (Max 100 words)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && (
          <p className="error">{errors.description}</p>
        )}

        {/* IMAGE */}
        <label>Upload Photo</label>
        <input
          key={fileKey}
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
        />

          <button type="submit">Submit Found Item</button>

        </form>
      </div>
    </div>
  );
};

export default FoundForm;