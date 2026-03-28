const mongoose = require("mongoose");

const helpRequestSchema = new mongoose.Schema(
  {
    // Student Information fields (NOW OPTIONAL)
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    studentId: {
      type: String,
      default: "",
      trim: true,
    },
    faculty: {
      type: String,
      default: "",
      trim: true,
    },
    yearOfStudy: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // Existing fields (kept)
    title: {
      type: String,
      required: true,
      trim: true,
    },
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
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Keep these optional (even if not used by new form)
    preferredContact: {
      type: String,
      enum: ["IN_APP", "EMAIL", "PHONE"],
      default: "IN_APP",
    },
    contactEmail: {
      type: String,
      default: "",
      trim: true,
    },
    contactPhone: {
      type: String,
      default: "",
      trim: true,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
      default: "OPEN",
    },
    requesterKey: {
      type: String,
      required: true,
    },

    // OPTIONAL (for admin reply feature)
    adminReply: {
      type: String,
      default: "",
      trim: true,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpRequest", helpRequestSchema);