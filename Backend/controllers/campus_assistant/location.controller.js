const Location = require("../../models/campus_assistant/location.model");

// CREATE location
const createLocation = async (req, res) => {
  try {
    const {
      name,
      category,
      building,
      floor,
      roomNumber,
      nearbyLandmark,
      description,
      googleMapsLink,
      image,
      status,
    } = req.body;

    if (!name || !category || !building || !floor || !googleMapsLink) {
      return res.status(400).json({
        message: "Name, category, building, floor, and Google Maps link are required",
      });
    }

    const existingLocation = await Location.findOne({ name: name.trim() });

    if (existingLocation) {
      return res.status(400).json({ message: "Location already exists" });
    }

    const newLocation = await Location.create({
      name,
      category,
      building,
      floor,
      roomNumber,
      nearbyLandmark,
      description,
      googleMapsLink,
      image,
      status,
    });

    res.status(201).json({
      message: "Location created successfully",
      location: newLocation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all locations
const getLocations = async (req, res) => {
  try {
    const { search, category, status } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { building: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { nearbyLandmark: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    const locations = await Location.find(filter).sort({ createdAt: -1 });

    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET one location by ID
const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE location
const updateLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Location updated successfully",
      location: updatedLocation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE location
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    await location.deleteOne();

    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};