const HelpRequest = require("../models/helpRequest.model");

// POST /api/help
exports.createHelpRequest = async (req, res) => {
  try {
    const created = await HelpRequest.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/help
exports.getHelpRequests = async (req, res) => {
  try {
    const { status, supportType, q } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (supportType) filter.supportType = supportType;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const list = await HelpRequest.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/help/:id
exports.getHelpRequestById = async (req, res) => {
  try {
    const item = await HelpRequest.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Help request not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID" });
  }
};

// PATCH /api/help/:id/status
exports.updateHelpStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Help request not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/help/:id
exports.deleteHelpRequest = async (req, res) => {
  try {
    const deleted = await HelpRequest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Help request not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid ID" });
  }
};