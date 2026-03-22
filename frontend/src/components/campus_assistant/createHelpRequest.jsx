import React, { useState } from "react";
import { createHelpRequest } from "../../services/helpApi";
import "./createHelpRequest.css";

export default function CreateHelpRequest() {
  const [form, setForm] = useState({
    supportType: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    attachments: [],
  });

  // ✅ keep your validation rule: first non-space character must be a letter
  const firstNonSpaceIsLetter = (value) => {
    const trimmedStart = value.replace(/^\s+/, "");
    if (trimmedStart.length === 0) return true;
    return /^[A-Za-z]/.test(trimmedStart);
  };

  const onChange = (e) => {
    const { name, value, type, files } = e.target;

    // File handling (still kept)
    if (type === "file") {
      const arr = Array.from(files || []);
      const limited = arr.slice(0, 3);
      setForm((prev) => ({ ...prev, attachments: limited }));
      return;
    }

    // ✅ block typing numbers/symbols as first character for title & description
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

    if (titleTrimmed.length < 5)
      return "Request subject must be at least 5 characters";
    if (!/^[A-Za-z]/.test(titleTrimmed))
      return "Request subject must start with a letter (no numbers/symbols at the beginning)";

    if (descTrimmed.length < 10)
      return "Description must be at least 10 characters";
    if (!/^[A-Za-z]/.test(descTrimmed))
      return "Description must start with a letter (no numbers/symbols at the beginning)";

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
        requesterKey: getRequesterKey(),
        supportType: form.supportType,
        title: form.title,
        description: form.description,
        priority: form.priority,
      };

      await createHelpRequest(payload);
      alert("Support request submitted!");

      // ✅ stay on same page + clear form
      setForm({
        supportType: "",
        title: "",
        description: "",
        priority: "MEDIUM",
        attachments: [],
      });
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
            <label>Supporting documents (optional)</label>
            <input
              type="file"
              multiple
              name="attachments"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={onChange}
            />
            {form.attachments.length > 0 && (
              <div className="file-list">
                {form.attachments.map((f, i) => (
                  <div className="file-item" key={i}>
                    {f.name}
                  </div>
                ))}
              </div>
            )}
            <div className="hint">
              PDF, JPG, PNG, DOCX — max 10 MB each (up to 3 files)
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