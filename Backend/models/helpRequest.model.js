const mongoose = require("mongoose");

const helpRequestSchema = new mongoose.Schema(
  {
    // Student Support info
    title: { type: String, required: true, trim: true, minlength: 5 },

    supportType: {
      type: String,
      required: true,
      enum: [
        "ACADEMIC",
        "REGISTRATION",
        "FACILITIES",
        "IT_SUPPORT",
        "FINANCE",
        "CLUBS_EVENTS",
        "OTHER",
      ],
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    description: { type: String, required: true, minlength: 10 },

    preferredContact: {
      type: String,
      enum: ["EMAIL", "PHONE", "IN_APP"],
      default: "IN_APP",
    },

    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },

    isAnonymous: { type: Boolean, default: false },

    // Workflow
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN",
    },

    // later connect real userId when auth exists
    createdBy: { type: String, default: "anonymous" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpRequest", helpRequestSchema);