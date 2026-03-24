const HelpRequest = require("../../models/campus_assistant/helpRequest.model");


// CREATE
exports.createHelpRequest = async (req, res) => {
  try {
    const newHelpRequest = {
      ...req.body,
      document: req.file ? `/uploads/${req.file.filename}` : "",
    };

    const item = await HelpRequest.create(newHelpRequest);

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create help request",
      error: error.message,
    });
  }
};

// GET ALL (with filters)
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

    const items = await HelpRequest.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch help requests",
      error: error.message,
    });
  }
};

// GET ONE BY ID
exports.getHelpRequestById = async (req, res) => {
  try {
    const item = await HelpRequest.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Request not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch help request",
      error: error.message,
    });
  }
};

// GET MY REQUESTS (by requesterKey)
exports.getMyHelpRequests = async (req, res) => {
  try {
    const { requesterKey } = req.query;

    if (!requesterKey) {
      return res.status(400).json({ message: "requesterKey is required" });
    }

    const items = await HelpRequest.find({ requesterKey }).sort({
      createdAt: -1,
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student requests",
      error: error.message,
    });
  }
};

// ✅ REPLY (ADMIN)
exports.replyToHelpRequest = async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply || adminReply.trim().length < 2) {
      return res.status(400).json({ message: "adminReply is required" });
    }

    const updated = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { adminReply: adminReply.trim() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Request not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Reply failed",
      error: error.message,
    });
  }
};

// ✅ STATUS UPDATE (ADMIN)
exports.updateHelpStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["OPEN", "IN_PROGRESS", "RESOLVED"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Request not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Status update failed",
      error: error.message,
    });
  }
};

// DELETE
exports.deleteHelpRequest = async (req, res) => {
  try {
    await HelpRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Help request deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete help request",
      error: error.message,
    });
  }
};