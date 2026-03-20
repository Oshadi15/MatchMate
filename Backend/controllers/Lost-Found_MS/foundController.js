const FoundItem = require("../models/FoundItem");


// ==============================
// CREATE FOUND ITEM
// ==============================
exports.createFoundItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      color,
      dateTime,
      location,
      description,
    } = req.body;

    const newItem = new FoundItem({
      itemName,
      category,
      color,
      dateTime,
      location,
      description,
      image: req.file ? req.file.filename : null,
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      success: true,
      message: "Found item added successfully",
      data: savedItem,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating found item",
      error: error.message,
    });
  }
};


// ==============================
// GET ALL FOUND ITEMS
// ==============================
exports.getAllFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};


// ==============================
// GET SINGLE FOUND ITEM
// ==============================
exports.getFoundItemById = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching item",
      error: error.message,
    });
  }
};


// ==============================
// UPDATE FOUND ITEM
// ==============================
exports.updateFoundItem = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    };

    // if new image uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedItem = await FoundItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updatedItem,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    });
  }
};


// ==============================
// DELETE FOUND ITEM
// ==============================
exports.deleteFoundItem = async (req, res) => {
  try {
    const deletedItem = await FoundItem.findByIdAndDelete(
      req.params.id
    );

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    });
  }
};