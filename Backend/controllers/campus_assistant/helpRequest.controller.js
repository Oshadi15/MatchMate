const HelpRequest = require("../../models/campus_assistant/helpRequest.model");

// CREATE
exports.createHelpRequest = async (req, res) => {
  try {
    const {
      fullName,
      studentId,
      faculty,
      yearOfStudy,
      email,
      phone,
      title,
      supportType,
      priority,
      description,
      preferredContact,
      contactEmail,
      contactPhone,
      isAnonymous,
      requesterKey,
    } = req.body;

    if (!title || !supportType || !description || !requesterKey) {
      return res.status(400).json({
        message: "title, supportType, description, and requesterKey are required",
      });
    }

    const newHelpRequest = {
      fullName,
      studentId,
      faculty,
      yearOfStudy,
      email,
      phone,
      title,
      supportType,
      priority,
      description,
      preferredContact,
      contactEmail,
      contactPhone,
      isAnonymous,
      requesterKey,
      document: req.file ? `/uploads/${req.file.filename}` : "",
    };

    const item = await HelpRequest.create(newHelpRequest);

    res.status(201).json({
      message: "Help request created successfully",
      request: item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create help request",
      error: error.message,
    });
  }
};

// GET ALL (ADMIN - with filters)
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
        { fullName: { $regex: q, $options: "i" } },
        { studentId: { $regex: q, $options: "i" } },
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

    if (!item) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch help request",
      error: error.message,
    });
  }
};

// GET MY REQUESTS (STUDENT - by requesterKey)
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

// REPLY (ADMIN)
exports.replyToHelpRequest = async (req, res) => {
  try {
    const { adminReply, status } = req.body;

    if (!adminReply || adminReply.trim().length < 2) {
      return res.status(400).json({ message: "adminReply is required" });
    }

    const updateData = {
      adminReply: adminReply.trim(),
      repliedAt: new Date(),
    };

    if (status) {
      const allowed = ["OPEN", "IN_PROGRESS", "RESOLVED"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      updateData.status = status;
    }

    const updated = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      message: "Reply sent successfully",
      request: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Reply failed",
      error: error.message,
    });
  }
};

// STATUS UPDATE (ADMIN)
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

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      message: "Status updated successfully",
      request: updated,
    });
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
    const deleted = await HelpRequest.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Help request deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete help request",
      error: error.message,
    });
  }
};