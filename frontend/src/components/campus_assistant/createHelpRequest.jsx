import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHelpRequest } from "../../services/helpApi";
import "./createHelpRequest.css";

const initialForm = {
  supportType: "",
  title: "",
  description: "",
  priority: "MEDIUM",
  document: null,
};

const initialErrors = {
  supportType: "",
  title: "",
  description: "",
  document: "",
};

export default function CreateHelpRequest() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const firstNonSpaceIsLetter = (value) => {
    const trimmedStart = value.replace(/^\s+/, "");
    if (trimmedStart.length === 0) return true;
    return /^[A-Za-z]/.test(trimmedStart);
  };

  const validateField = (name, value, file = null) => {
    if (name === "supportType") {
      if (!value.trim()) return "Category is required";
      return "";
    }

    if (name === "title") {
      const titleTrimmed = value.trim();

      if (!titleTrimmed) return "Request subject is required";
      if (titleTrimmed.length < 5) {
        return "Request subject must be at least 5 characters";
      }
      if (!/^[A-Za-z]/.test(titleTrimmed)) {
        return "Request subject must start with a letter";
      }
      return "";
    }

    if (name === "description") {
      const descTrimmed = value.trim();

      if (!descTrimmed) return "Description is required";
      if (descTrimmed.length < 10) {
        return "Description must be at least 10 characters";
      }
      if (!/^[A-Za-z]/.test(descTrimmed)) {
        return "Description must start with a letter";
      }
      return "";
    }

    if (name === "document") {
      if (file && file.size > 10 * 1024 * 1024) {
        return "Document size must be less than 10 MB";
      }
      return "";
    }

    return "";
  };

  const onChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files && files[0] ? files[0] : null;

      setForm((prev) => ({ ...prev, document: file }));
      setErrors((prev) => ({
        ...prev,
        document: validateField("document", "", file),
      }));
      return;
    }

    if (type !== "checkbox" && (name === "title" || name === "description")) {
      if (value.length === 0) {
        setForm((prev) => ({ ...prev, [name]: "" }));
        setErrors((prev) => ({
          ...prev,
          [name]: validateField(name, ""),
        }));
        return;
      }

      if (!firstNonSpaceIsLetter(value)) {
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (Object.prototype.hasOwnProperty.call(initialErrors, name)) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const setPriority = (p) => setForm((prev) => ({ ...prev, priority: p }));

  const validate = () => {
    const newErrors = {
      supportType: validateField("supportType", form.supportType),
      title: validateField("title", form.title),
      description: validateField("description", form.description),
      document: validateField("document", "", form.document),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    const isValid = validate();
    if (!isValid) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Please login first");
        return;
      }

      const requesterKey = user._id || user.email;

      if (!requesterKey) {
        alert("Logged user information is missing");
        return;
      }

      const formData = new FormData();
      formData.append("requesterKey", requesterKey);
      formData.append("supportType", form.supportType);
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("priority", form.priority);

      if (form.document) {
        formData.append("document", form.document);
      }

      await createHelpRequest(formData);

      setSuccessMessage(
        "Support request submitted successfully. You can now track its status and admin reply in My Help Requests."
      );

      setForm(initialForm);
      setErrors(initialErrors);

      const fileInput = document.getElementById("help-request-document");
      if (fileInput) fileInput.value = "";
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
          <div className="field">
            <label>
              Category <span className="req">*</span>
            </label>
            <select
              name="supportType"
              value={form.supportType}
              onChange={onChange}
            >
              <option value="">Select category</option>
              <option value="ACADEMIC">Academic</option>
              <option value="REGISTRATION">Registration</option>
              <option value="FACILITIES">Facilities</option>
              <option value="IT_SUPPORT">IT Support</option>
              <option value="FINANCE">Finance</option>
              <option value="CLUBS_EVENTS">Clubs & Events</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.supportType && (
              <p className="field-error">{errors.supportType}</p>
            )}
          </div>

          <div className="field">
            <label>
              Request subject <span className="req">*</span>
            </label>
            <input
              name="title"
              placeholder="Brief title of your issue"
              value={form.title}
              onChange={onChange}
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="field">
            <label>
              Description <span className="req">*</span>
            </label>
            <textarea
              name="description"
              rows={6}
              placeholder="Describe your issue in detail..."
              value={form.description}
              onChange={onChange}
            />
            {errors.description && (
              <p className="field-error">{errors.description}</p>
            )}
          </div>

          <div className="field">
            <label>
              Priority <span className="req">*</span>
            </label>
            <div className="segmented">
              <button
                type="button"
                className={`seg-btn ${form.priority === "LOW" ? "active" : ""}`}
                onClick={() => setPriority("LOW")}
              >
                Low — can wait
              </button>
              <button
                type="button"
                className={`seg-btn ${form.priority === "MEDIUM" ? "active" : ""}`}
                onClick={() => setPriority("MEDIUM")}
              >
                Medium — this week
              </button>
              <button
                type="button"
                className={`seg-btn ${form.priority === "HIGH" ? "active" : ""}`}
                onClick={() => setPriority("HIGH")}
              >
                High — urgent
              </button>
            </div>
          </div>

          <div className="field">
            <label>Supporting document (optional)</label>
            <input
              id="help-request-document"
              type="file"
              name="document"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={onChange}
            />

            {errors.document && (
              <p className="field-error">{errors.document}</p>
            )}

            {form.document && (
              <div className="file-list">
                <div className="file-item">{form.document.name}</div>
              </div>
            )}

            <div className="hint">
              PDF, JPG, PNG, DOC, DOCX — max 10 MB
            </div>
          </div>

          <button className="create-help-request-button" type="submit">
            Submit Request
          </button>

          {successMessage && (
            <div className="success-box">
              <p>{successMessage}</p>
              <button
                type="button"
                className="view-requests-btn"
                onClick={() => navigate("/my-help-requests")}
              >
                View My Requests
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}