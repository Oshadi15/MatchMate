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
      description,
      nearbyLandmark,
      googleMapsLink,
      image,
      status,
    } = req.body;

    if (!name || !category || !building || !floor || !googleMapsLink) {
      return res.status(400).json({
        message: "Name, category, building, floor, and Google Maps link are required",
      });
    }

    const existingLocation = await Location.findOne({ name });

    if (existingLocation) {
      return res.status(400).json({ message: "Location already exists" });
    }

    const location = await Location.create({
      name,
      category,
      building,
      floor,
      roomNumber,
      description,
      nearbyLandmark,
      googleMapsLink,
      image,
      status,
    });

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all locations
const getLocations = async (req, res) => {
  try {
    const { category, search } = req.query;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const locations = await Location.find(filter).sort({ createdAt: -1 });

    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single location by ID
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

    res.status(200).json(updatedLocation);
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