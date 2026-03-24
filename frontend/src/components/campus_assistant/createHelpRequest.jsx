import React, { useState } from "react";
import { createHelpRequest } from "../../services/helpApi";
import "./createHelpRequest.css";

export default function CreateHelpRequest() {
  const [form, setForm] = useState({
    supportType: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    document: null,
  });

  const firstNonSpaceIsLetter = (value) => {
    const trimmedStart = value.replace(/^\s+/, "");
    if (trimmedStart.length === 0) return true;
    return /^[A-Za-z]/.test(trimmedStart);
  };

  const onChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files && files[0] ? files[0] : null;
      setForm((prev) => ({ ...prev, document: file }));
      return;
    }

    if (type !== "checkbox" && (name === "title" || name === "description")) {
      if (value.length === 0) {
        setForm((prev) => ({ ...prev, [name]: "" }));
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
  };

  const setPriority = (p) => setForm((prev) => ({ ...prev, priority: p }));

  const validate = () => {
    const titleTrimmed = form.title.trim();
    const descTrimmed = form.description.trim();

    if (!form.supportType) return "Category is required";

    if (titleTrimmed.length < 5) {
      return "Request subject must be at least 5 characters";
    }

    if (!/^[A-Za-z]/.test(titleTrimmed)) {
      return "Request subject must start with a letter (no numbers/symbols at the beginning)";
    }

    if (descTrimmed.length < 10) {
      return "Description must be at least 10 characters";
    }

    if (!/^[A-Za-z]/.test(descTrimmed)) {
      return "Description must start with a letter (no numbers/symbols at the beginning)";
    }

    if (form.document && form.document.size > 10 * 1024 * 1024) {
      return "Document size must be less than 10 MB";
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
      const formData = new FormData();
      formData.append("requesterKey", getRequesterKey());
      formData.append("supportType", form.supportType);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("priority", form.priority);

      if (form.document) {
        formData.append("document", form.document);
      }

      await createHelpRequest(formData);
      alert("Support request submitted!");

      setForm({
        supportType: "",
        title: "",
        description: "",
        priority: "MEDIUM",
        document: null,
      });

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
        </form>
      </div>
    </div>
  );
}