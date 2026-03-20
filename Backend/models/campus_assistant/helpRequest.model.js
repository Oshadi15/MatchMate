const mongoose = require("mongoose");

const helpRequestSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpRequest", helpRequestSchema);