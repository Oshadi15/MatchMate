import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import API from "../../services/api";
import logo from "../../assets/f3.png";
import "./FeedbackInsert.css";

function FeedbackInsertPage() {

  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    section: "",
    contact: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  /* ================= VALIDATION ================= */
  const validate = () => {
    let newErrors = {};

    // ✅ Name validation (letters + spaces only)
    if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can contain only letters";
    }

    // ✅ Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.gmail)) {
      newErrors.gmail = "Enter a valid email address";
    }

    // ✅ Contact validation (10 digits only)
    if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = "Contact number must be 10 digits";
    }

    // ✅ Feedback word limit (100 words)
    const wordCount = formData.message.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 100) {
      newErrors.message = "Feedback must be less than 100 words";
    }

    // Required checks
    if (!formData.section) {
      newErrors.section = "Please select a year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent letters in contact number
    if (name === "contact") {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // remove error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await API.post("/api/feedback/", formData);

      setStatus("✅ Feedback submitted successfully!");

      setFormData({
        name: "",
        gmail: "",
        section: "",
        contact: "",
        message: "",
      });

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus("❌ Failed to submit feedback.");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="feedback-page">

      {/* NAVBAR */}
      <nav className="feedback-navbar">
        <a href="/" className="nav-title">Lost And Found System</a>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/feedback">Feedback</a>
          <a href="/">Logout</a>
        </div>
      </nav>

      {/* LOGO */}
      <div className="feedback-logo">
        <img src={logo} alt="Logo" />
      </div>

      {/* FORM CARD */}
      <div className="feedback-card">
        <h2>
          <FontAwesomeIcon icon={faCommentDots} />
          Submit Your Feedback
        </h2>

        <form onSubmit={handleSubmit} className="feedback-form">

          {/* NAME */}
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            className={errors.name ? "input-error" : ""}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}

          {/* EMAIL */}
          <input
            type="email"
            name="gmail"
            placeholder="Email Address"
            value={formData.gmail}
            onChange={handleChange}
            required
            className={errors.gmail ? "input-error" : ""}
          />
          {errors.gmail && <p className="error-text">{errors.gmail}</p>}

          {/* SECTION */}
          <select
            name="section"
            value={formData.section}
            onChange={handleChange}
            required
            className={errors.section ? "input-error" : ""}
          >
            <option value="">Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
          {errors.section && <p className="error-text">{errors.section}</p>}

          {/* CONTACT */}
          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            maxLength={10}
            required
            className={errors.contact ? "input-error" : ""}
          />
          {errors.contact && <p className="error-text">{errors.contact}</p>}

          {/* MESSAGE */}
          <textarea
            name="message"
            placeholder="Your Feedback (Max 100 words)"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            required
            className={errors.message ? "input-error" : ""}
          />
          {errors.message && <p className="error-text">{errors.message}</p>}

          <button type="submit">Submit Feedback</button>

        </form>

        {status && <p className="status-msg">{status}</p>}
      </div>
    </div>
  );
}

export default FeedbackInsertPage;