const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Lecture Hall",
        "Lab",
        "Library",
        "Office",
        "Cafeteria",
        "Parking",
        "Medical",
        "Sports",
        "Washroom",
        "Other",
      ],
    },
    building: {
      type: String,
      required: true,
      trim: true,
    },
    floor: {
      type: String,
      required: true,
      trim: true,
    },
    roomNumber: {
      type: String,
      trim: true,
      default: "",
    },
    nearbyLandmark: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    googleMapsLink: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Available", "Temporarily Closed"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Location", locationSchema);