import React, { useState } from "react";
import { createHelpRequest } from "../../services/helpApi";
import { useNavigate } from "react-router-dom";
import "./createHelpRequest.css";

export default function CreateHelpRequest() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    supportType: "",
    priority: "MEDIUM",
    description: "",
    preferredContact: "IN_APP",
    contactEmail: "",
    contactPhone: "",
    isAnonymous: false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (form.title.trim().length < 5) {
      return "Title must be at least 5 characters";
    }

    if (!form.supportType) {
      return "Support type is required";
    }

    if (form.description.trim().length < 10) {
      return "Description must be at least 10 characters";
    }

    if (form.preferredContact === "EMAIL" && !form.contactEmail.trim()) {
      return "Email is required when preferred contact is EMAIL";
    }

    if (form.preferredContact === "PHONE" && !form.contactPhone.trim()) {
      return "Phone number is required when preferred contact is PHONE";
    }

    return null;
  };

  const getRequesterKey = () => {
    let requesterKey = localStorage.getItem("studentRequesterKey");

    if (!requesterKey) {
      requesterKey = `student_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
      localStorage.setItem("studentRequesterKey", requesterKey);
    }

    return requesterKey;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    try {
      const payload = {
        ...form,
        requesterKey: getRequesterKey(),
      };

      await createHelpRequest(payload);
      alert("Support request submitted!");
      navigate("/my-requests");
    } catch (error) {
      console.error("Submit failed:", error);
      alert(error.response?.data?.message || "Submit failed");
    }
  };

  return (
    <div className="create-help-request-page">
      <div className="create-help-request-card">
        <h2>Student Help Request Form</h2>
        <p className="create-help-request-subtitle">
          Submit your academic or non-academic issue using the form below.
        </p>

        <form className="create-help-request-form" onSubmit={onSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title (e.g., Exam schedule clarification)"
            value={form.title}
            onChange={onChange}
          />

          <div className="create-help-request-row">
            <select
              name="supportType"
              value={form.supportType}
              onChange={onChange}
            >
              <option value="">Select Support Type</option>
              <option value="ACADEMIC">ACADEMIC</option>
              <option value="REGISTRATION">REGISTRATION</option>
              <option value="FACILITIES">FACILITIES</option>
              <option value="IT_SUPPORT">IT_SUPPORT</option>
              <option value="FINANCE">FINANCE</option>
              <option value="CLUBS_EVENTS">CLUBS & EVENTS</option>
              <option value="OTHER">OTHER</option>
            </select>

            <select name="priority" value={form.priority} onChange={onChange}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <textarea
            name="description"
            placeholder="Describe your question/request clearly..."
            rows={5}
            value={form.description}
            onChange={onChange}
          />

          <select
            name="preferredContact"
            value={form.preferredContact}
            onChange={onChange}
          >
            <option value="IN_APP">In-app reply</option>
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone</option>
          </select>

          {form.preferredContact === "EMAIL" && (
            <input
              type="email"
              name="contactEmail"
              placeholder="Your email"
              value={form.contactEmail}
              onChange={onChange}
            />
          )}

          {form.preferredContact === "PHONE" && (
            <input
              type="text"
              name="contactPhone"
              placeholder="Your phone number"
              value={form.contactPhone}
              onChange={onChange}
            />
          )}

          <label className="create-help-request-checkbox">
            <input
              type="checkbox"
              name="isAnonymous"
              checked={form.isAnonymous}
              onChange={onChange}
            />
            Submit anonymously
          </label>

          <button className="create-help-request-button" type="submit">
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}