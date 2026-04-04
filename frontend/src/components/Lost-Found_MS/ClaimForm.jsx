import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./ClaimForm.css";

const ClaimForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [itemData, setItemData] = useState(null);
  const [loadingItem, setLoadingItem] = useState(true);

  const [formData, setFormData] = useState({
    claimantName: "",
    email: "",
    contact: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoadingItem(true);

        // Try found item first
        let res;
        try {
          res = await axios.get(`http://localhost:5000/api/found/${id}`);
        } catch {
          // If not found in found items, try lost items
          res = await axios.get(`http://localhost:5000/api/lost/${id}`);
        }

        setItemData(res.data);
      } catch (error) {
        console.error("Error fetching item details:", error);
        setStatus("Failed to load item details.");
      } finally {
        setLoadingItem(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const validate = () => {
    const newErrors = {};

    if (!formData.claimantName.trim()) {
      newErrors.claimantName = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.claimantName.trim())) {
      newErrors.claimantName = "Name can contain only letters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = "Contact number must be 10 digits";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Please explain why this item belongs to you";
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = "Please give more details";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact" && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!validate()) return;

    try {
      setSubmitting(true);

      await axios.post("http://localhost:5000/api/claims", {
        itemId: id,
        itemName: itemData?.itemName || "",
        claimantName: formData.claimantName,
        email: formData.email,
        contact: formData.contact,
        reason: formData.reason,
        status: "Pending",
      });

      setStatus("Claim submitted successfully!");

      setFormData({
        claimantName: "",
        email: "",
        contact: "",
        reason: "",
      });

      setTimeout(() => {
        navigate("/browseitems");
      }, 1500);
    } catch (error) {
      console.error("Error submitting claim:", error);
      setStatus("Failed to submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingItem) {
    return (
      <div className="claim-page">
        <div className="claim-container">
          <h2 className="claim-title">Claim Item</h2>
          <p className="claim-status">Loading item details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="claim-page">
      <div className="claim-container">
        <h2 className="claim-title">Claim Item</h2>

        <form className="claim-form" onSubmit={handleSubmit}>
          <div className="claim-group">
            <label>Item Name</label>
            <input
              type="text"
              value={itemData?.itemName || ""}
              readOnly
            />
          </div>

          <div className="claim-group">
            <label>Your Name</label>
            <input
              type="text"
              name="claimantName"
              placeholder="Enter your name"
              value={formData.claimantName}
              onChange={handleChange}
              className={errors.claimantName ? "claim-input-error" : ""}
            />
            {errors.claimantName && (
              <p className="claim-error-text">{errors.claimantName}</p>
            )}
          </div>

          <div className="claim-group">
            <label>Your Email</label>
            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "claim-input-error" : ""}
            />
            {errors.email && (
              <p className="claim-error-text">{errors.email}</p>
            )}
          </div>

          <div className="claim-group">
            <label>Contact Number</label>
            <input
              type="text"
              name="contact"
              placeholder="Enter contact number"
              value={formData.contact}
              onChange={handleChange}
              maxLength={10}
              className={errors.contact ? "claim-input-error" : ""}
            />
            {errors.contact && (
              <p className="claim-error-text">{errors.contact}</p>
            )}
          </div>

          <div className="claim-group">
            <label>Explain why this item belongs to you</label>
            <textarea
              name="reason"
              placeholder="Describe identifying details of the item"
              value={formData.reason}
              onChange={handleChange}
              className={errors.reason ? "claim-input-error" : ""}
            />
            {errors.reason && (
              <p className="claim-error-text">{errors.reason}</p>
            )}
          </div>

          <div className="claim-actions">
            <button
              type="submit"
              className="claim-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Claim"}
            </button>
          </div>

          {status && <p className="claim-status">{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default ClaimForm;