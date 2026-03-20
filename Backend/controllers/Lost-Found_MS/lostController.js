const LostItem = require("../../models/Lost-Found_MS/LostItem");


// ================= CREATE =================
exports.createLostItem = async (req, res) => {
  try {
    const newItem = new LostItem({
      ...req.body,
      image: req.file ? req.file.filename : null,
    });

    const savedItem = await newItem.save();

    res.status(201).json({
      success: true,
      message: "Lost item reported successfully",
      data: savedItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= READ ALL =================
exports.getAllLostItems = async (req, res) => {
  try {
    const items = await LostItem.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= READ ONE =================
exports.getLostItemById = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= UPDATE =================
exports.updateLostItem = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedItem = await LostItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Item updated",
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ================= DELETE =================
exports.deleteLostItem = async (req, res) => {
  try {
    await LostItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};