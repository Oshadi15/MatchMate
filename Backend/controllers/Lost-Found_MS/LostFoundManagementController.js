const Item = require("../../models/Lost-Found_MS/LostFoundManagement");

/* ================= FETCH ALL ITEMS ================= */
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ITEM ================= */
exports.deleteItem = async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ITEM ================= */
exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= STATUS UPDATE ================= */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CLAIM ACTION ================= */
exports.handleClaim = async (req, res) => {
  try {
    const { decision } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (decision === "approved") {
      item.status = "claimed";
      item.claimRequest = false;
    } else if (decision === "rejected") {
      item.claimRequest = false;
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};