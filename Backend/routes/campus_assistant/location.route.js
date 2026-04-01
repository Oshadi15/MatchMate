const express = require("express");
const router = express.Router();

const {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} = require("../../controllers/campus_assistant/location.controller");

// Create location
router.post("/", createLocation);

// Get all locations
router.get("/", getLocations);

// Get one location
router.get("/:id", getLocationById);

// Update location
router.put("/:id", updateLocation);

// Delete location
router.delete("/:id", deleteLocation);

module.exports = router;