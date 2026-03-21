const HelpRequest = require("../../models/campus_assistant/helpRequest.model");

exports.createHelpRequest = async (req, res) => {
  try {
    const item = await HelpRequest.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create help request",
      error: error.message,
    });
  }
};

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