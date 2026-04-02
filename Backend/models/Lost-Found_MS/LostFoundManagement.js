const mongoose = require("mongoose");

const LostFoundManagementSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  type: { type: String, enum: ["lost", "found"], required: true }, // lost or found
  category: { type: String },
  color: { type: String },
  dateTime: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // URL or base64
  status: { type: String, enum: ["pending", "claimed", "returned"], default: "pending" },
  claimRequest: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("LostFoundManagement", LostFoundManagementSchema);